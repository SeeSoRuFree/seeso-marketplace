---
description: 배포 사전 검사 및 실행 - 인프라 자동 감지, 작업 분석, 배포 전략 결정
---

# Seeso Deploy Command

이 명령어는 다음 단계로 배포를 진행합니다:
1. 인프라 확인 (캐시 또는 자동 감지)
2. 변경 내용 분석 및 1차 판단
3. 사용자 확인 & 픽스
4. 배포 실행

---

## Step 0: 인프라 캐시 확인

먼저 프로젝트에 저장된 인프라 설정이 있는지 확인합니다.

### 캐시 파일 위치

`.seeso-deploy.json` 파일을 프로젝트 루트에서 확인:

```bash
cat .seeso-deploy.json 2>/dev/null
```

### 캐시 파일 형식

```json
{
  "version": "1.0",
  "detected_at": "2024-01-20T12:00:00Z",
  "infrastructure": {
    "frontend": {
      "platform": "vercel",
      "directory": "careerly-v2",
      "evidence": ".vercel/"
    },
    "backend": {
      "platform": "aws-ec2-asg",
      "directory": "careerly-v2-api",
      "evidence": "terraform/ + .github/workflows/deploy.yml"
    },
    "cicd": "github-actions"
  },
  "git": {
    "deploy_author": "seeso user <partner@seeso.kr>",
    "main_branch": "main",
    "staging_branch": "develop"
  }
}
```

### 캐시 사용 로직

1. **캐시 파일이 있으면**: 저장된 정보 사용, 인프라 감지 스킵
   ```
   📦 인프라 (캐시 사용)
   ├─ Frontend: Vercel (careerly-v2)
   ├─ Backend: AWS EC2 ASG (careerly-v2-api)
   └─ 배포 Author: seeso user <partner@seeso.kr>

   ℹ️ 인프라 재감지가 필요하면 "인프라 다시 감지해줘" 라고 말해주세요.
   ```

2. **캐시 파일이 없으면**: Step 1로 진행하여 인프라 감지

3. **사용자가 재감지 요청하면**: 캐시 무시하고 Step 1 실행

### 캐시 저장

인프라 감지 완료 후, 사용자에게 저장 여부를 확인:

```
인프라 감지가 완료되었습니다.
이 설정을 저장하면 다음 배포 시 자동으로 사용됩니다.

저장할까요? [Y/n]
```

"Y" 또는 "맞아" 응답 시:

```bash
# .seeso-deploy.json 파일 생성
cat > .seeso-deploy.json << 'EOF'
{
  "version": "1.0",
  "detected_at": "{현재 시간}",
  "infrastructure": {
    "frontend": {
      "platform": "{감지된 플랫폼}",
      "directory": "{디렉토리}",
      "evidence": "{근거 파일}"
    },
    "backend": {
      "platform": "{감지된 플랫폼}",
      "directory": "{디렉토리}",
      "evidence": "{근거 파일}"
    },
    "cicd": "{CI/CD 플랫폼}"
  },
  "git": {
    "deploy_author": "{배포용 author}",
    "main_branch": "main",
    "staging_branch": "develop"
  }
}
EOF

echo "✅ .seeso-deploy.json 저장 완료"
echo "ℹ️ 이 파일을 .gitignore에 추가하거나 커밋하여 팀과 공유할 수 있습니다."
```

### 캐시 관련 사용자 명령

| 명령 | 동작 |
|------|------|
| "인프라 다시 감지해줘" | 캐시 무시하고 재감지 |
| "인프라 설정 저장해줘" | 현재 설정을 .seeso-deploy.json에 저장 |
| "인프라 설정 삭제해줘" | .seeso-deploy.json 삭제 |
| "배포 author 변경해줘" | git.deploy_author 수정 |

---

## Step 1: 인프라 자동 감지

> ℹ️ `.seeso-deploy.json` 캐시가 없거나 재감지 요청 시에만 실행

다음 파일들을 확인하여 인프라를 감지합니다.

### Frontend 인프라 감지

다음 순서로 파일 존재 여부를 확인:

```bash
# Vercel
ls vercel.json .vercel/ 2>/dev/null

# AWS Amplify
ls amplify.yml amplify/ 2>/dev/null

# Netlify
ls netlify.toml 2>/dev/null

# Firebase Hosting
ls firebase.json 2>/dev/null && grep -l "hosting" firebase.json

# Self-hosted (Dockerfile + Next.js/React)
ls Dockerfile 2>/dev/null && (grep -l "next" package.json 2>/dev/null || grep -l "react" package.json 2>/dev/null)
```

감지 우선순위:
1. `vercel.json` 또는 `.vercel/` → **Vercel (확실)**
2. `amplify.yml` → **AWS Amplify**
3. `netlify.toml` → **Netlify**
4. `firebase.json` + `"hosting"` → **Firebase Hosting**
5. `Dockerfile` + `package.json(next/react)` → **Self-hosted**

### Vercel 추가 감지 (웹 연동 케이스)

Vercel CLI가 아닌 웹에서 GitHub 연동만 한 경우 `.vercel/` 폴더가 없을 수 있습니다.

#### 추측 감지 조건

다음 조건을 모두 만족하면 **Vercel 가능성 높음**:
1. Next.js 프로젝트 (`next` in package.json)
2. 다른 배포 설정 없음 (amplify.yml, netlify.toml, Dockerfile 없음)
3. GitHub 저장소임

```bash
# Next.js 프로젝트인지 확인
grep -q '"next"' package.json 2>/dev/null && echo "Next.js 프로젝트"

# 다른 배포 설정 없는지 확인
! ls amplify.yml netlify.toml Dockerfile 2>/dev/null && echo "다른 배포 설정 없음"

# GitHub 원격 저장소인지 확인
git remote get-url origin 2>/dev/null | grep -q "github.com" && echo "GitHub 저장소"
```

#### 감지 결과 분류

| 상태 | 조건 | 동작 |
|------|------|------|
| **확실** | `.vercel/` 또는 `vercel.json` 존재 | 바로 Vercel로 진행 |
| **추측** | Next.js + 다른 설정 없음 | 사용자에게 확인 |
| **불명확** | 위 조건 모두 불충족 | 사용자에게 선택 요청 |

#### 사용자 확인 (추측 시)

```
🤔 배포 환경 확인이 필요합니다.

Next.js 프로젝트가 감지되었지만, 명확한 배포 설정을 찾지 못했습니다.

이 프로젝트의 프론트엔드 배포 환경은 무엇인가요?
1. Vercel (웹에서 GitHub 연동)
2. Vercel (CLI로 설정)
3. AWS Amplify
4. Netlify
5. Self-hosted (Docker)
6. 기타

선택하거나 직접 입력해주세요:
```

#### 사용자 응답 처리

| 응답 | 동작 |
|------|------|
| "버셀", "vercel", "1" | Vercel로 설정 |
| "앰플리파이", "amplify", "3" | AWS Amplify로 설정 |
| "netlify", "4" | Netlify로 설정 |
| "도커", "docker", "5" | Self-hosted로 설정 |

선택 후 `.seeso-deploy.json`에 저장하여 다음부터는 묻지 않음:

```json
{
  "infrastructure": {
    "frontend": {
      "platform": "vercel",
      "directory": ".",
      "evidence": "user-specified",
      "detection_method": "manual"
    }
  }
}
```

### Backend 인프라 감지

```bash
# AWS ECR + ECS/EC2 (GitHub Actions)
ls .github/workflows/*.yml 2>/dev/null && grep -l "amazon-ecr\|aws-actions" .github/workflows/*.yml 2>/dev/null

# Kubernetes
ls kubernetes/ k8s/ helm/ 2>/dev/null

# Terraform + ASG
ls terraform/*.tf 2>/dev/null && grep -l "aws_autoscaling_group\|aws_ecs" terraform/*.tf 2>/dev/null

# Serverless Framework
ls serverless.yml serverless.yaml 2>/dev/null

# Fly.io
ls fly.toml 2>/dev/null

# Render
ls render.yaml 2>/dev/null

# Docker Compose (일반)
ls docker-compose.yml docker-compose.yaml 2>/dev/null
```

감지 우선순위:
1. GitHub Actions + ECR → **AWS ECS/EC2**
2. `kubernetes/` 또는 `k8s/` → **Kubernetes**
3. `terraform/` + ASG/ECS → **Terraform + AWS**
4. `serverless.yml` → **Serverless Framework**
5. `fly.toml` → **Fly.io**
6. `render.yaml` → **Render**
7. `docker-compose.yml` → **Docker Compose**

### 모노레포 감지

프로젝트 루트에서 여러 디렉토리를 확인:

```bash
# 일반적인 프론트엔드 디렉토리명
ls -d frontend/ web/ client/ app/ 2>/dev/null

# 일반적인 백엔드 디렉토리명
ls -d backend/ api/ server/ 2>/dev/null

# 프로젝트 특정 패턴 (예: careerly)
ls -d *-v2/ *-api/ *-web/ *-frontend/ *-backend/ 2>/dev/null
```

각 하위 디렉토리에서 개별적으로 인프라 감지를 수행합니다.

---

## Step 2: 변경 내용 분석

### 2.1 변경 파일 목록 수집

```bash
# Staged changes
git diff --cached --name-only

# Unstaged changes
git diff --name-only

# 전체 변경 (staged + unstaged)
git diff HEAD --name-only

# 변경 통계
git diff HEAD --stat
```

### 2.2 변경 영역 판단

변경된 파일 경로를 분석하여 Frontend/Backend 구분:

- Frontend 변경: `*.tsx`, `*.jsx`, `*.vue`, `*.svelte`, `components/`, `pages/`, `app/`, `src/` (프론트 프로젝트 내)
- Backend 변경: `*.py`, `*.go`, `*.java`, `*.rs`, `api/`, `views/`, `controllers/`, `services/`

### 2.3 변경 패턴 분석

```bash
# 변경 내용 상세 (추가/삭제 라인)
git diff HEAD

# 변경 라인 수
git diff HEAD --numstat
```

다음 패턴을 분석:

| 패턴 | 검색 방법 | 의미 |
|------|----------|------|
| 에러 핸들링 수정 | `try`, `catch`, `throw`, `error`, `except` | 버그 수정 가능성 |
| 조건문 수정 | `if`, `else`, `&&`, `\|\|`, `?` | 로직 버그 수정 |
| 새 함수/클래스 | `function`, `class`, `def`, `const.*=.*=>` | 새 기능 |
| 새 파일 | `git diff --name-status \| grep "^A"` | 새 기능 |
| 파일 삭제 | `git diff --name-status \| grep "^D"` | 리팩토링/정리 |

### 2.4 민감 영역 체크

다음 경로/키워드가 포함되면 민감 영역으로 판단:

- **인증**: `auth`, `login`, `logout`, `session`, `token`, `jwt`
- **결제**: `payment`, `billing`, `checkout`, `order`, `transaction`
- **보안**: `security`, `permission`, `role`, `admin`, `password`
- **개인정보**: `user`, `profile`, `personal`, `private`

### 2.5 코드 품질 검사

```bash
# Mock 코드 검출
git diff HEAD | grep -E "(mock|Mock|MOCK|useMockData|mockData)"
git diff HEAD --name-only | xargs grep -l "from.*mock\|import.*mock" 2>/dev/null

# TODO/FIXME 검출
git diff HEAD | grep -E "(TODO|FIXME|WIP|XXX|HACK):"

# 디버그 코드 검출
git diff HEAD | grep -E "(console\.(log|warn|error)|print\(|debugger)"
```

### 2.6 커밋 메시지 분석 (이미 커밋된 경우)

```bash
# 최근 커밋 메시지
git log -1 --format="%s"

# 커밋 메시지에서 키워드 추출
git log -1 --format="%s" | grep -iE "(fix|bug|hotfix|urgent|critical|feat|add|update|refactor)"
```

---

## Step 3: 1차 판단

수집된 정보를 바탕으로 다음을 판단합니다.

### 작업 성격 판단 기준

**🔴 Hotfix (긴급)**
- 변경 규모: ≤20줄, ≤3파일
- 패턴: 에러 핸들링 수정, 조건문 수정
- 키워드: `fix`, `bug`, `hotfix`, `urgent`, `critical`, `긴급`
- Mock/TODO: 없음

**🟡 Bugfix (일반 버그 수정)**
- 변경 규모: 20-100줄
- 패턴: 기존 로직 수정
- 키워드: `fix`, `bug`, `수정`, `오류`
- 새 파일 추가 없음

**🟢 Feature (새 기능)**
- 변경 규모: >100줄 또는 >10파일
- 패턴: 새 파일 추가, 새 함수/클래스
- 키워드: `feat`, `add`, `추가`, `구현`, `new`
- 또는 Mock 코드 사용 중

### 배포 범위 판단 기준

| 작업 성격 | Mock/TODO 없음 | Mock/TODO 있음 |
|----------|---------------|---------------|
| 🔴 Hotfix | Production 직행 가능 | Production 불가 |
| 🟡 Bugfix | Staging → Prod | Staging Only |
| 🟢 Feature | Staging → Prod | Staging Only |

---

## Step 4: 사용자 확인 & 픽스

분석 결과를 다음 형식으로 출력합니다:

```
🚀 Seeso Deploy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 인프라 감지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:  {감지된 인프라} ({근거 파일})
Backend:   {감지된 인프라} ({근거 파일})
CI/CD:     {감지된 CI/CD}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 변경 내용 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
파일:      {N}개 변경 (+{추가}줄, -{삭제}줄)
영역:      {Frontend/Backend/Both}
패턴:      {감지된 패턴}
민감영역:  {있음/없음} {있으면 상세}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 변경 파일 목록 (TODO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

변경된 파일들을 TodoWrite 도구를 사용하여 TODO 리스트로 등록합니다.
각 파일의 변경 내용을 요약하여 다음 형식으로 등록:

- content: "{파일경로} - {변경 요약}"
- status: "pending"
- activeForm: "{파일경로} 배포 중"

예시:
[
  {"content": "app/community/page.tsx - 터치 스크롤 개선 (+2줄, -2줄)", "status": "pending", "activeForm": "app/community/page.tsx 배포 중"},
  {"content": "lib/api/hooks/useAuthMutations.ts - 앱 로그인 완료 메시지 추가 (+9줄)", "status": "pending", "activeForm": "useAuthMutations.ts 배포 중"},
  {"content": ".gitignore - 무시 파일 추가 (+1줄)", "status": "pending", "activeForm": ".gitignore 배포 중"}
]

TodoWrite 도구로 위 목록을 등록하면 사용자가 진행 상황을 확인할 수 있습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 1차 판단
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
작업 성격:   {🔴 Hotfix / 🟡 Bugfix / 🟢 Feature}
배포 범위:   {Staging Only / Staging → Prod / Prod 직행}
배포 대상:   {Frontend / Backend / Both}

⚠️  검사 결과:
    {Mock/TODO/Debug 코드 발견 시 상세 위치}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️  확인 & 수정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

위 판단이 맞나요? 수정이 필요하면 알려주세요.

예시:
- "핫픽스야, 프로덕션 바로 배포해줘"
- "TODO는 무시해도 돼"
- "스테이징만 배포하면 됨"
- "백엔드만 배포해"
- "맞아" (그대로 진행)
```

### 사용자 응답 처리

사용자 응답에서 다음 키워드를 인식:

| 키워드 | 동작 |
|--------|------|
| `핫픽스`, `긴급`, `hotfix`, `urgent` | 작업 성격 → Hotfix |
| `프로덕션`, `운영`, `prod`, `production` | 배포 범위 → Production 포함 |
| `스테이징`, `staging`, `테스트` | 배포 범위 → Staging Only |
| `무시`, `괜찮`, `진행`, `ignore` | 경고 무시하고 진행 |
| `프론트`, `frontend`, `FE` | 배포 대상 → Frontend Only |
| `백엔드`, `backend`, `BE`, `API` | 배포 대상 → Backend Only |
| `맞아`, `확인`, `ㅇㅇ`, `yes`, `ok` | 현재 판단대로 진행 |

수정 사항을 반영한 후 최종 확인:

```
✅ 수정 반영
├─ 작업 성격: {변경 전} → {변경 후}
├─ 배포 범위: {변경 전} → {변경 후}
└─ 경고 처리: {무시/확인 필요}

이대로 진행할까요? [Y/n]
```

---

## Step 5: 배포 실행

### 5.1 Git Author 설정 (Vercel 자동 배포용)

**Vercel 인프라가 감지된 경우**, 자동 배포가 되는 author를 찾아서 설정해야 합니다.

#### 5.1.1 기존 배포 성공한 커밋에서 Author 찾기

```bash
# 최근 성공적으로 배포된 커밋들의 author 확인
# (Vercel은 특정 author의 커밋만 자동 배포하는 경우가 있음)

# 방법 1: 최근 main/master 브랜치의 커밋 author 패턴 분석
git log origin/main --format='%an <%ae>' -20 | sort | uniq -c | sort -rn | head -5

# 방법 2: 가장 최근 배포된 커밋의 author
git log origin/main -1 --format='%an <%ae>'

# 방법 3: Vercel CLI로 최근 배포 확인 (설치된 경우)
vercel list --prod 2>/dev/null | head -5
```

#### 5.1.2 배포 가능한 Author 자동 감지

다음 순서로 배포 가능한 author를 찾습니다:

1. **기존 성공 배포 커밋에서 추출**
   ```bash
   # main 브랜치에서 가장 많이 사용된 author
   DEPLOY_AUTHOR=$(git log origin/main --format='%an <%ae>' -50 | sort | uniq -c | sort -rn | head -1 | awk '{$1=""; print $0}' | xargs)
   echo "감지된 배포 Author: $DEPLOY_AUTHOR"
   ```

2. **설정 파일에서 확인** (있는 경우)
   - `.claude/settings.json`의 `seeso-deploy.git.author.*` 설정

3. **기본값 사용**
   - `seeso user <partner@seeso.kr>`

#### 5.1.3 Author 설정 및 커밋

```bash
# 감지된 또는 설정된 author로 변경
git config user.name "{감지된 author 이름}"
git config user.email "{감지된 author 이메일}"

# 현재 설정 확인
echo "현재 Git Author: $(git config user.name) <$(git config user.email)>"
```

#### 5.1.4 Push 실패 시 Author 재확인

Push가 실패하거나 Vercel 배포가 트리거되지 않으면:

```bash
# 1. 현재 커밋의 author 확인
git log -1 --format='%an <%ae>'

# 2. 최근 성공 배포된 커밋과 비교
LAST_DEPLOYED_AUTHOR=$(git log origin/main -1 --format='%an <%ae>')
CURRENT_AUTHOR=$(git log -1 --format='%an <%ae>')

if [ "$CURRENT_AUTHOR" != "$LAST_DEPLOYED_AUTHOR" ]; then
    echo "⚠️ Author 불일치 감지"
    echo "현재: $CURRENT_AUTHOR"
    echo "배포용: $LAST_DEPLOYED_AUTHOR"
    echo ""
    echo "커밋 author를 변경합니다..."

    # 마지막 커밋의 author 수정
    git commit --amend --author="$LAST_DEPLOYED_AUTHOR" --no-edit
fi

# 3. 다시 push
git push origin {branch}
```

#### 5.1.5 Vercel 배포 상태 확인

```bash
# Push 후 Vercel 배포 트리거 확인
echo "Vercel 배포 상태 확인 중..."

# 방법 1: Vercel CLI (설치된 경우)
vercel list 2>/dev/null | head -3

# 방법 2: GitHub에서 deployment 상태 확인
gh api repos/{owner}/{repo}/deployments --jq '.[0] | {state: .statuses_url, created_at: .created_at}'

# 방법 3: 30초 대기 후 배포 URL 확인
sleep 30
echo "Vercel 대시보드에서 배포 상태를 확인하세요: https://vercel.com/dashboard"
```

### 5.2 브랜치 분리 및 커밋

main이나 staging 브랜치에서 직접 작업하더라도, 배포 시에는 **임시 브랜치를 생성하여 머지**합니다.

#### 5.2.1 현재 브랜치 확인

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "현재 브랜치: $CURRENT_BRANCH"

# main 또는 staging(develop) 브랜치인지 확인
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ] || [ "$CURRENT_BRANCH" = "staging" ] || [ "$CURRENT_BRANCH" = "develop" ]; then
    echo "⚠️ 보호된 브랜치에서 작업 중입니다. 임시 브랜치를 생성합니다."
    NEED_BRANCH=true
else
    NEED_BRANCH=false
fi
```

#### 5.2.2 임시 브랜치 생성 및 커밋

```bash
if [ "$NEED_BRANCH" = true ]; then
    # 타임스탬프 기반 브랜치명 생성
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)

    # 작업 성격에 따른 브랜치 prefix
    # Hotfix → hotfix/
    # Bugfix → fix/
    # Feature → feat/
    BRANCH_PREFIX="{작업 성격에 따라 결정}"  # hotfix, fix, feat 중 하나

    # 브랜치명 생성 (예: fix/deploy-20240120-143052)
    NEW_BRANCH="${BRANCH_PREFIX}/deploy-${TIMESTAMP}"

    echo "📌 임시 브랜치 생성: $NEW_BRANCH"

    # 변경사항을 stash
    git stash push -m "seeso-deploy temp stash"

    # 새 브랜치 생성 및 전환
    git checkout -b "$NEW_BRANCH"

    # stash 복원
    git stash pop

    # 변경사항 스테이징
    git add -A

    # 커밋 (배포용 author로)
    git commit --author="{배포용 author}" -m "{커밋 메시지}"

    echo "✅ 커밋 완료: $NEW_BRANCH"
fi
```

#### 5.2.3 타겟 브랜치로 머지

```bash
# 배포 범위에 따른 타겟 브랜치 결정
# Staging Only → develop/staging
# Production → main

TARGET_BRANCH="{배포 범위에 따라 결정}"  # main 또는 develop

echo "🔀 $NEW_BRANCH → $TARGET_BRANCH 머지 중..."

# 타겟 브랜치로 전환
git checkout "$TARGET_BRANCH"

# 최신 상태로 업데이트
git pull origin "$TARGET_BRANCH"

# 머지 (--no-ff로 머지 커밋 생성)
git merge --no-ff "$NEW_BRANCH" -m "Merge branch '$NEW_BRANCH' into $TARGET_BRANCH

배포: {작업 성격} - {간단한 설명}

Co-Authored-By: {배포용 author}"

echo "✅ 머지 완료"
```

#### 5.2.4 Push 및 임시 브랜치 정리

```bash
# 타겟 브랜치 push
git push origin "$TARGET_BRANCH"

echo "✅ Push 완료: $TARGET_BRANCH"

# 임시 브랜치 삭제 (로컬)
git branch -d "$NEW_BRANCH"

# 임시 브랜치 삭제 (원격 - 선택)
# git push origin --delete "$NEW_BRANCH"

echo "🧹 임시 브랜치 정리 완료"
```

#### 5.2.5 전체 플로우 요약

```
현재 상태: main 브랜치에서 작업 중, 변경사항 있음
         │
         ▼
┌─────────────────────────────────────────┐
│ 1. 임시 브랜치 생성                      │
│    fix/deploy-20240120-143052           │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 2. 변경사항 커밋 (배포용 author)         │
│    "fix: 로그인 오류 수정"              │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 3. main으로 머지 (--no-ff)              │
│    "Merge branch 'fix/deploy-...' ..."  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 4. Push → Vercel/CI 자동 배포 트리거    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 5. 임시 브랜치 삭제                      │
└─────────────────────────────────────────┘
```

### 5.3 이미 별도 브랜치에서 작업 중인 경우

```bash
if [ "$NEED_BRANCH" = false ]; then
    echo "✅ 이미 별도 브랜치에서 작업 중입니다: $CURRENT_BRANCH"

    # 변경사항 스테이징 및 커밋
    git add -A
    git commit --author="{배포용 author}" -m "{커밋 메시지}"

    # 현재 브랜치 push
    git push origin "$CURRENT_BRANCH"

    # 타겟 브랜치로 PR 생성 또는 머지
    # ... (이전 로직과 동일)
fi
```

커밋 메시지 형식:
- Hotfix: `fix: {간단한 설명}`
- Bugfix: `fix: {간단한 설명}`
- Feature: `feat: {간단한 설명}`

### 5.3 인프라별 배포 실행

감지된 인프라에 따라 해당 전략 파일을 참조하여 배포:

- Vercel → `strategies/vercel.md` 참조
- AWS EC2 ASG → `strategies/aws-ec2-asg.md` 참조
- Kubernetes → `strategies/kubernetes.md` 참조
- 기타 → 해당 전략 파일 참조

### 5.4 배포 상태 확인

```bash
# GitHub Actions 상태 확인
gh run list --limit 5

# 특정 워크플로우 상태 확인
gh run list --workflow=deploy.yml --limit 3

# 진행 중인 배포 모니터링
gh run watch
```

---

## 에러 처리

### Mock/TODO 발견 시 Production 배포 요청

```
⛔ Production 배포 불가

다음 문제가 발견되었습니다:
├─ Mock 코드: components/Profile.tsx:15
└─ TODO 주석: lib/hooks/useProfile.ts:42

해결 방법:
1. Mock 코드를 실제 API로 교체
2. TODO 항목 처리 완료
3. 또는 Staging 배포만 진행

Staging 배포로 변경할까요? [Y/n]
```

### 인프라 감지 실패 시

```
⚠️ 인프라를 자동으로 감지하지 못했습니다.

배포 환경을 선택해주세요:
1. Vercel (Frontend)
2. AWS EC2/ECS (Backend)
3. Kubernetes
4. Docker Compose
5. 수동 설정

선택:
```

### 권한 오류 시

```
⛔ 배포 권한 오류

{에러 메시지}

확인 사항:
- GitHub 토큰 권한
- AWS 자격 증명
- Vercel 로그인 상태
```
