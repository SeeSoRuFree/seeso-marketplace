# Serverless Framework 배포 전략

## 개요

Serverless Framework를 사용한 AWS Lambda, API Gateway 등 서버리스 배포입니다.

## 사전 조건 확인

```bash
# Serverless CLI 설치 확인
which serverless || which sls || echo "Serverless not installed"

# 버전 확인
serverless --version

# AWS 자격 증명 확인
aws sts get-caller-identity

# serverless.yml 확인
cat serverless.yml
```

## 설정 파일 구조

```yaml
# serverless.yml 예시
service: my-service

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}
  region: ap-northeast-2

functions:
  api:
    handler: handler.main
    events:
      - http:
          path: /
          method: any
```

## Staging 배포

```bash
# staging 스테이지로 배포
serverless deploy --stage staging

# 또는 줄여서
sls deploy -s staging
```

### 특정 함수만 배포

```bash
# 빠른 함수 배포
serverless deploy function -f {functionName} --stage staging
```

### 배포 상태 확인

```bash
# 배포 정보
serverless info --stage staging

# 로그 확인
serverless logs -f {functionName} --stage staging -t
```

## Production 배포

```bash
# production 스테이지로 배포
serverless deploy --stage production

# 또는
sls deploy -s prod
```

### 배포 전 검증

```bash
# 패키징만 (배포 없이)
serverless package --stage production

# 로컬 테스트
serverless invoke local -f {functionName}
```

## 롤백

### 방법 1: 이전 배포로 롤백

```bash
# 배포 히스토리 확인
serverless deploy list --stage production

# 특정 타임스탬프로 롤백
serverless rollback --timestamp {timestamp} --stage production
```

### 방법 2: 함수 버전 롤백

```bash
# Lambda 버전 목록 (AWS CLI)
aws lambda list-versions-by-function --function-name {function-name}

# 별칭을 이전 버전으로 변경
aws lambda update-alias \
  --function-name {function-name} \
  --name {alias} \
  --function-version {version}
```

### 방법 3: Git 기반 롤백

```bash
# 이전 커밋으로 체크아웃
git checkout {previous-commit}

# 재배포
serverless deploy --stage production
```

## 환경 변수 관리

### serverless.yml에서 관리

```yaml
provider:
  environment:
    DB_HOST: ${env:DB_HOST}
    API_KEY: ${ssm:/my-service/api-key}
```

### 스테이지별 환경 변수

```yaml
custom:
  environment:
    staging:
      DB_HOST: staging-db.example.com
    production:
      DB_HOST: prod-db.example.com

provider:
  environment:
    DB_HOST: ${self:custom.environment.${self:provider.stage}.DB_HOST}
```

## 트러블슈팅

### 배포 실패

```bash
# 상세 로그로 배포
serverless deploy --stage staging --verbose

# CloudFormation 스택 상태 확인
aws cloudformation describe-stack-events \
  --stack-name {service-name}-{stage}
```

### 함수 실행 오류

```bash
# 로그 확인
serverless logs -f {functionName} --stage staging

# CloudWatch 로그 직접 확인
aws logs tail /aws/lambda/{function-name} --follow
```

### 권한 오류

```bash
# IAM 역할 확인
aws iam get-role --role-name {role-name}

# 정책 확인
aws iam list-attached-role-policies --role-name {role-name}
```

## 유용한 명령어

```bash
# 서비스 제거
serverless remove --stage {stage}

# 오프라인 테스트 (serverless-offline 플러그인)
serverless offline

# 메트릭 확인
serverless metrics --stage production
```
