# AWS EC2 ASG 배포 전략

## 개요

GitHub Actions를 통한 ECR 이미지 빌드 → ASG Instance Refresh 방식의 배포입니다.

일반적인 흐름:
1. Git push → GitHub Actions 트리거
2. Docker 이미지 빌드 → ECR 푸시
3. ASG Instance Refresh 시작
4. Rolling update로 무중단 배포

## 사전 조건 확인

```bash
# GitHub CLI 설치 확인
which gh || echo "GitHub CLI not installed"

# AWS CLI 설치 확인 (선택)
which aws || echo "AWS CLI not installed"

# GitHub Actions 워크플로우 확인
ls .github/workflows/*.yml

# 배포 워크플로우 내용 확인
cat .github/workflows/deploy.yml
```

## Staging 배포

### 브랜치 전략: develop → Staging

```bash
# develop 브랜치로 전환
git checkout develop

# 변경사항 머지 또는 직접 커밋
git merge {source-branch}
# 또는
git add . && git commit -m "fix: {설명}"

# 푸시 → GitHub Actions 자동 트리거
git push origin develop
```

### 배포 상태 확인

```bash
# GitHub Actions 실행 목록
gh run list --workflow=deploy.yml --limit 5

# 진행 중인 워크플로우 모니터링
gh run watch

# 특정 실행 로그 확인
gh run view {run-id} --log
```

### ASG 상태 확인 (AWS CLI)

```bash
# ASG 인스턴스 상태
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names "careerly-v2-staging-asg" \
  --query 'AutoScalingGroups[0].Instances[*].[InstanceId,LifecycleState,HealthStatus]'

# Instance Refresh 상태
aws autoscaling describe-instance-refreshes \
  --auto-scaling-group-name "careerly-v2-staging-asg" \
  --query 'InstanceRefreshes[0].[Status,PercentageComplete]'
```

## Production 배포

### 브랜치 전략: main → Production

```bash
# main 브랜치로 전환
git checkout main

# develop에서 머지 (일반적인 경우)
git merge develop

# 또는 hotfix 브랜치에서 직접 머지
git merge hotfix/{branch-name}

# 푸시 → GitHub Actions 자동 트리거
git push origin main
```

### PR을 통한 배포 (권장)

```bash
# PR 생성
gh pr create --base main --head develop \
  --title "Release: {버전 또는 설명}" \
  --body "## 변경사항\n- ...\n\n## 테스트\n- Staging에서 검증 완료"

# PR 머지 (승인 후)
gh pr merge --squash
```

### Hotfix 직접 배포

```bash
# main에서 직접 작업 (긴급 시)
git checkout main
git add .
git commit -m "fix: 긴급 수정 - {설명}"
git push origin main
```

## 롤백

### 방법 1: 이전 커밋으로 Revert

```bash
# 이전 커밋으로 revert
git revert HEAD
git push origin main

# GitHub Actions가 자동으로 이전 이미지로 재배포
```

### 방법 2: ECR 이전 이미지로 수동 배포

```bash
# ECR 이미지 목록 확인
aws ecr describe-images \
  --repository-name careerly-v2 \
  --query 'imageDetails[*].[imageTags,imagePushedAt]' \
  --output table

# ASG 수동 refresh (이전 이미지 태그로)
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name "careerly-v2-asg"
```

### 방법 3: GitHub Actions 수동 재실행

```bash
# 이전 성공한 워크플로우 재실행
gh run rerun {run-id}
```

## 배포 설정 확인

### GitHub Actions 워크플로우 분석

일반적인 deploy.yml 구조:
```yaml
on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    # main → production
    # develop → staging
```

### 환경별 설정

| 환경 | 브랜치 | ASG 이름 | Min Healthy |
|------|--------|---------|-------------|
| Staging | develop | *-staging-asg | 0% |
| Production | main | *-asg | 50% |

## 트러블슈팅

### GitHub Actions 실패

```bash
# 실패 로그 확인
gh run view {run-id} --log-failed

# 일반적인 원인
# - Docker 빌드 실패
# - ECR 푸시 권한 오류
# - AWS 자격 증명 만료
```

### ASG Instance Refresh 실패

```bash
# Refresh 상태 확인
aws autoscaling describe-instance-refreshes \
  --auto-scaling-group-name "{asg-name}"

# 일반적인 원인
# - 헬스 체크 실패
# - 시작 템플릿 오류
# - 용량 부족
```

### 헬스 체크 실패

```bash
# EC2 인스턴스 로그 확인
aws ec2 get-console-output --instance-id {instance-id}

# ALB 타겟 그룹 상태
aws elbv2 describe-target-health --target-group-arn {arn}
```

## 배포 완료 확인

```bash
# API 헬스 체크
curl -s https://{api-domain}/api/v1/health/

# 버전 확인 (버전 엔드포인트가 있는 경우)
curl -s https://{api-domain}/api/v1/version/
```
