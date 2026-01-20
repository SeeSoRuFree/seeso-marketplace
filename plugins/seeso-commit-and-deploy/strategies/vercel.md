# Vercel 배포 전략

## 개요

Vercel은 Git push 기반 자동 배포를 지원합니다.
- `main`/`master` 브랜치 → Production 자동 배포
- 기타 브랜치 → Preview 배포

## 사전 조건 확인

```bash
# Vercel CLI 설치 확인
which vercel || echo "Vercel CLI not installed"

# 프로젝트 연결 확인
ls .vercel/project.json 2>/dev/null || echo "Project not linked"

# 로그인 상태 확인
vercel whoami 2>/dev/null || echo "Not logged in"
```

## Staging 배포 (Preview)

### 방법 1: Git Push (권장)

```bash
# 현재 브랜치 확인
git branch --show-current

# 변경사항 푸시 → 자동으로 Preview URL 생성
git push origin $(git branch --show-current)
```

푸시 후:
1. Vercel이 자동으로 빌드 시작
2. Preview URL 생성 (예: `https://project-abc123.vercel.app`)
3. GitHub PR에 Preview 링크 자동 코멘트

### 방법 2: CLI 직접 배포

```bash
# Preview 배포
vercel

# 결과에서 Preview URL 확인
```

### 배포 상태 확인

```bash
# 최근 배포 목록
vercel list

# GitHub Actions 상태 (연동된 경우)
gh run list --limit 3
```

## Production 배포

### 방법 1: main 브랜치 머지 (권장)

```bash
# main 브랜치로 전환
git checkout main

# 변경사항 머지
git merge {source-branch}

# 푸시 → 자동 Production 배포
git push origin main
```

### 방법 2: CLI 직접 배포

```bash
# Production 배포
vercel --prod
```

### 방법 3: PR 머지

```bash
# PR 생성
gh pr create --base main --title "{제목}" --body "{설명}"

# PR 머지 (승인 후)
gh pr merge --squash
```

## 롤백

### 방법 1: Vercel 대시보드

1. Vercel 대시보드 접속
2. Deployments 탭
3. 이전 배포 선택 → "Promote to Production"

### 방법 2: CLI

```bash
# 배포 목록 확인
vercel list

# 특정 배포로 롤백
vercel rollback {deployment-url}
```

### 방법 3: Git Revert

```bash
# 이전 커밋으로 revert
git revert HEAD
git push origin main
```

## 환경 변수 관리

```bash
# 환경 변수 목록
vercel env ls

# 환경 변수 추가
vercel env add {NAME}

# 환경 변수 삭제
vercel env rm {NAME}
```

## 배포 URL 패턴

| 환경 | URL 패턴 |
|------|---------|
| Production | `https://{project}.vercel.app` |
| Preview | `https://{project}-{hash}.vercel.app` |
| Branch | `https://{project}-{branch}.vercel.app` |

## 트러블슈팅

### 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# Vercel 빌드 로그 확인
vercel logs {deployment-url}
```

### 환경 변수 누락

```bash
# 필요한 환경 변수 확인
cat .env.example

# Vercel 환경 변수와 비교
vercel env ls
```

### Author 불일치로 자동 배포 안됨

Vercel은 특정 author의 커밋만 자동 배포하는 경우가 있습니다.

#### 1. 배포 가능한 Author 찾기

```bash
# 최근 성공 배포된 커밋들의 author 분석
git log origin/main --format='%an <%ae>' -20 | sort | uniq -c | sort -rn

# 예시 출력:
#   15 seeso user <partner@seeso.kr>
#    3 다른 사용자 <other@example.com>
#    2 또 다른 사용자 <another@example.com>
# → 가장 많이 사용된 "seeso user <partner@seeso.kr>"가 배포용 author

# 자동 추출
DEPLOY_AUTHOR=$(git log origin/main --format='%an <%ae>' -50 | sort | uniq -c | sort -rn | head -1 | sed 's/^[[:space:]]*[0-9]*[[:space:]]*//')
echo "배포용 Author: $DEPLOY_AUTHOR"
```

#### 2. Author 설정 및 커밋 수정

```bash
# 배포용 author에서 이름과 이메일 분리
AUTHOR_NAME=$(echo "$DEPLOY_AUTHOR" | sed 's/ <.*//')
AUTHOR_EMAIL=$(echo "$DEPLOY_AUTHOR" | sed 's/.*<\(.*\)>/\1/')

# Git config 설정
git config user.name "$AUTHOR_NAME"
git config user.email "$AUTHOR_EMAIL"

# 이미 커밋한 경우: author 수정
git commit --amend --author="$DEPLOY_AUTHOR" --no-edit

# 강제 push (주의: 혼자 작업하는 브랜치에서만)
git push --force-with-lease origin $(git branch --show-current)
```

#### 3. 배포 트리거 확인

```bash
# Push 후 30초 대기
sleep 30

# Vercel 배포 목록 확인
vercel list 2>/dev/null | head -5

# 또는 GitHub deployment 상태
gh api repos/{owner}/{repo}/deployments --jq '.[0]'
```

#### 4. 여전히 배포 안 되면

```bash
# Vercel 프로젝트 설정 확인
vercel inspect

# 수동 배포
vercel --prod
```
