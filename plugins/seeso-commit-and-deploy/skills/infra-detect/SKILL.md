---
description: 프로젝트의 배포 인프라를 자동으로 감지합니다
---

# Infrastructure Detection Skill

이 스킬은 프로젝트의 배포 인프라를 자동으로 감지합니다.

## 감지 대상

### Frontend 플랫폼

| 플랫폼 | 시그니처 파일 | 우선순위 |
|--------|-------------|---------|
| Vercel | `vercel.json`, `.vercel/` | 1 |
| AWS Amplify | `amplify.yml`, `amplify/` | 2 |
| Netlify | `netlify.toml` | 3 |
| Firebase Hosting | `firebase.json` + `"hosting"` | 4 |
| Cloudflare Pages | `wrangler.toml` + `pages` | 5 |
| Self-hosted | `Dockerfile` + `next`/`react` in package.json | 6 |

### Backend 플랫폼

| 플랫폼 | 시그니처 파일 | 우선순위 |
|--------|-------------|---------|
| AWS ECS/EC2 | `.github/workflows/*.yml` + `amazon-ecr` | 1 |
| Kubernetes | `kubernetes/`, `k8s/`, `helm/`, `*.yaml` with `kind: Deployment` | 2 |
| Terraform + AWS | `terraform/*.tf` + `aws_autoscaling_group` | 3 |
| Serverless | `serverless.yml`, `serverless.yaml` | 4 |
| Fly.io | `fly.toml` | 5 |
| Render | `render.yaml` | 6 |
| Railway | `railway.json`, `railway.toml` | 7 |
| Docker Compose | `docker-compose.yml`, `docker-compose.yaml` | 8 |

### CI/CD 플랫폼

| 플랫폼 | 시그니처 파일 |
|--------|-------------|
| GitHub Actions | `.github/workflows/` |
| GitLab CI | `.gitlab-ci.yml` |
| Jenkins | `Jenkinsfile` |
| CircleCI | `.circleci/config.yml` |
| Bitbucket Pipelines | `bitbucket-pipelines.yml` |
| AWS CodePipeline | `buildspec.yml` |

## 감지 프로세스

### 1단계: 프로젝트 구조 파악

```bash
# 루트 디렉토리 구조 확인
ls -la

# 설정 파일 존재 여부 확인
ls *.json *.yml *.yaml *.toml 2>/dev/null
```

### 2단계: 모노레포 여부 확인

```bash
# 일반적인 모노레포 패턴
ls -d frontend/ backend/ web/ api/ client/ server/ packages/ apps/ 2>/dev/null

# 프로젝트명 기반 패턴
ls -d *-frontend/ *-backend/ *-web/ *-api/ *-v2/ *-v2-api/ 2>/dev/null
```

모노레포인 경우 각 하위 프로젝트에서 개별적으로 인프라 감지를 수행합니다.

### 3단계: Frontend 인프라 감지

```bash
# Vercel
if [ -f "vercel.json" ] || [ -d ".vercel" ]; then
    echo "FRONTEND: Vercel"
fi

# AWS Amplify
if [ -f "amplify.yml" ] || [ -d "amplify" ]; then
    echo "FRONTEND: AWS Amplify"
fi

# Netlify
if [ -f "netlify.toml" ]; then
    echo "FRONTEND: Netlify"
fi

# Firebase Hosting
if [ -f "firebase.json" ] && grep -q "hosting" firebase.json; then
    echo "FRONTEND: Firebase Hosting"
fi
```

### 4단계: Backend 인프라 감지

```bash
# AWS ECS/EC2 via GitHub Actions
if ls .github/workflows/*.yml 2>/dev/null | xargs grep -l "amazon-ecr\|aws-actions/amazon-ecs" 2>/dev/null; then
    echo "BACKEND: AWS ECS/EC2"
fi

# Kubernetes
if [ -d "kubernetes" ] || [ -d "k8s" ] || [ -d "helm" ]; then
    echo "BACKEND: Kubernetes"
fi

# Terraform + AWS
if ls terraform/*.tf 2>/dev/null | xargs grep -l "aws_autoscaling_group\|aws_ecs" 2>/dev/null; then
    echo "BACKEND: Terraform + AWS"
fi

# Serverless
if [ -f "serverless.yml" ] || [ -f "serverless.yaml" ]; then
    echo "BACKEND: Serverless Framework"
fi

# Fly.io
if [ -f "fly.toml" ]; then
    echo "BACKEND: Fly.io"
fi

# Render
if [ -f "render.yaml" ]; then
    echo "BACKEND: Render"
fi

# Docker Compose (일반)
if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
    echo "BACKEND: Docker Compose"
fi
```

### 5단계: CI/CD 감지

```bash
# GitHub Actions
if [ -d ".github/workflows" ]; then
    echo "CI/CD: GitHub Actions"
    ls .github/workflows/*.yml 2>/dev/null
fi

# GitLab CI
if [ -f ".gitlab-ci.yml" ]; then
    echo "CI/CD: GitLab CI"
fi

# Jenkins
if [ -f "Jenkinsfile" ]; then
    echo "CI/CD: Jenkins"
fi
```

## 출력 형식

```
📦 인프라 감지 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend
├─ 플랫폼: {Vercel|Amplify|Netlify|...}
├─ 근거: {감지된 파일}
└─ 디렉토리: {프론트엔드 경로}

Backend
├─ 플랫폼: {AWS ECS|Kubernetes|...}
├─ 근거: {감지된 파일}
└─ 디렉토리: {백엔드 경로}

CI/CD
├─ 플랫폼: {GitHub Actions|GitLab CI|...}
└─ 워크플로우: {워크플로우 파일 목록}
```

## 감지 실패 시

인프라를 자동으로 감지하지 못한 경우:

```
⚠️ 인프라 자동 감지 실패

발견된 설정 파일:
{발견된 파일 목록}

수동으로 선택해주세요:
1. Vercel
2. AWS ECS/EC2
3. Kubernetes
4. Serverless
5. Docker Compose
6. 기타 (직접 입력)
```
