# Netlify 배포 전략

## 개요

Netlify는 Git 기반 자동 배포를 지원합니다.
- Production 브랜치 push → Production 배포
- PR/브랜치 push → Deploy Preview

## 사전 조건 확인

```bash
# Netlify CLI 설치 확인
which netlify || echo "Netlify CLI not installed"

# 로그인 상태 확인
netlify status

# 사이트 연결 확인
cat .netlify/state.json 2>/dev/null || echo "Site not linked"
```

## Staging 배포 (Deploy Preview)

### 방법 1: Git Push

```bash
# 브랜치 푸시 → 자동 Deploy Preview
git push origin {branch-name}
```

### 방법 2: CLI 배포

```bash
# Draft 배포 (Preview)
netlify deploy

# 결과에서 Draft URL 확인
```

### 배포 상태 확인

```bash
# 배포 목록
netlify deploys

# 특정 배포 상태
netlify status
```

## Production 배포

### 방법 1: Production 브랜치 머지

```bash
# main 브랜치로 머지
git checkout main
git merge {branch}
git push origin main
```

### 방법 2: CLI 직접 배포

```bash
# Production 배포
netlify deploy --prod
```

### 방법 3: Deploy Preview 승격

```bash
# Draft → Production
netlify deploy --prod --alias {deploy-id}
```

## 롤백

### 방법 1: Netlify 대시보드

1. Deploys 페이지 접속
2. 이전 배포 선택
3. "Publish deploy" 클릭

### 방법 2: CLI

```bash
# 배포 목록 확인
netlify deploys

# 특정 배포로 롤백
netlify rollback
```

### 방법 3: Git Revert

```bash
git revert HEAD
git push origin main
```

## 환경 변수 관리

```bash
# 환경 변수 목록
netlify env:list

# 환경 변수 설정
netlify env:set {KEY} {value}

# 환경 변수 삭제
netlify env:unset {KEY}
```

## 빌드 설정 (netlify.toml)

```toml
[build]
  publish = "dist"
  command = "npm run build"

[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "staging" }
```

## 트러블슈팅

### 빌드 실패

```bash
# 로컬 빌드 테스트
npm run build

# Netlify 빌드 로그 확인
netlify open:admin  # 대시보드에서 확인
```

### 환경 변수 누락

```bash
# 필요한 환경 변수 확인
cat .env.example

# Netlify 환경 변수 비교
netlify env:list
```
