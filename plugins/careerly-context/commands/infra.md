# 커리어리 인프라 정보

커리어리 프로젝트의 인프라 설정 정보를 조회합니다.

## 핵심 정보

### AWS 설정
- **프로필**: `dev_careerly`
- **리전**: ap-northeast-2 (서울)

### RDS 인스턴스

| DB | Endpoint | 용도 |
|----|----------|------|
| careerly-v2-staging-new | careerly-v2-staging-new.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com | **로컬 개발용** |
| careerly-v2-prod-db | careerly-v2-prod-db.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com | 배포 환경 전용 |

### 서버 구성

| 서버 | 포트 | 경로 | 실행 명령 |
|------|------|------|-----------|
| agent-poc | 8001 | ./agent-poc | `uvicorn main:app --host 0.0.0.0 --port 8001 --reload` |
| careerly-v2 (front) | 3000 | ./careerly-v2 | `pnpm dev --port 3000` |
| careerly2-backend | 8000 | ./careerly2-backend | `./venv/bin/python manage.py runserver 0.0.0.0:8000` |

### 보안그룹
- **sg-0f1e71089397d1280**: RDS 접근용
- IP가 자주 변경됨 - Access denied 시 IP 재추가 필요

```bash
# 내 IP 추가
MY_IP=$(curl -s ifconfig.me)
aws ec2 authorize-security-group-ingress --profile dev_careerly \
  --group-id sg-0f1e71089397d1280 \
  --protocol tcp --port 3306 \
  --cidr ${MY_IP}/32
```

## 레거시 (사용 금지)

| 항목 | 상태 | 이유 |
|------|------|------|
| beta-database-all | ❌ LEGACY | 테이블명 lowercase, v2와 불일치 |
| careerly-v2-staging-db | ❌ 삭제됨 | careerly-v2-staging-new 사용 |
| careerly-legacy/ | ❌ LEGACY | 구버전 코드 |

## 추가 정보 조회

특정 정보가 필요하면:
1. CLAUDE.md 파일 확인
2. 슬랙 #커리어리-운영 검색
3. AWS CLI로 직접 조회

$ARGUMENTS
