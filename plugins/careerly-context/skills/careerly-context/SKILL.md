---
name: careerly-context
description: 커리어리 프로젝트 컨텍스트 플러그인. "커리어리", "회의록", "인프라", "왜 이렇게 결정", "AWS", "RDS" 등 키워드에 자동 활성화.
---

# Careerly Context Plugin

> 프로젝트의 '기억'을 담당하는 레이어

---

## 📌 핵심 정보 영역

### 1. 인프라/AWS
| 항목 | 값 |
|------|-----|
| **AWS 프로필** | `dev_careerly` |
| **RDS Staging** | `careerly-v2-staging-new.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com` |
| **RDS Prod** | `careerly-v2-prod-db.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com` |
| **DB Name** | `careerly_v2` |
| **DB User** | `admin` |

⚠️ **주의사항**:
- 로컬 개발 시 **반드시 Staging DB** 사용
- IP 자주 변경됨 → Access denied 시 보안그룹에 IP 재추가
- ❌ `beta-database-all` 사용 금지 (Legacy)

### 2. 서버 구성
| 서버 | 포트 | 경로 | 실행 |
|------|------|------|------|
| **Frontend** | 3000 | `./careerly-v2` | `pnpm dev` |
| **Backend** | 8000 | `./careerly2-backend` | `python manage.py runserver` |
| **Agent POC** | 8001 | `./agent-poc` | `uvicorn main:app` |

### 3. 슬랙 채널
| 채널 | 용도 | ID |
|------|------|-----|
| `#공식-회의록` | 회의록 저장 | C01BZ0TSDNX |
| `#커리어리-제품` | 제품 논의 | - |
| `#커리어리-운영` | 운영 이슈 | - |

### 4. 레거시 (사용 금지)
- ❌ `beta-database-all` - 테이블명 불일치
- ❌ `careerly-v2-staging-db` - 삭제됨
- ❌ `careerly-legacy/` 디렉토리

---

## 🔍 검색 패턴

### 질문 유형별 검색 전략

| 질문 유형 | 검색 소스 | 예시 |
|-----------|----------|------|
| **인프라/설정** | CLAUDE.md → Slack | "RDS 설정", "AWS 프로필" |
| **회의 내용** | Slack #공식-회의록 | "오늘 회의록", "MCP 논의" |
| **의사결정** | Slack 검색 → 스레드 | "왜 카카오 로그인 선택" |
| **에러/장애** | Slack → CloudWatch | "알람 왜 뜨지", "unhealthy" |
| **코드 위치** | Grep/Glob | "푸시 기능 어디", "API 엔드포인트" |

### Slack 검색

```python
# 회의록 검색
mcp__slack__conversations_search_messages(
    search_query="키워드",
    filter_in_channel="#공식-회의록",
    limit=20
)

# 최근 회의록
mcp__slack__conversations_history(
    channel_id="#공식-회의록",
    limit="1d"
)

# 스레드 상세
mcp__slack__conversations_replies(
    channel_id="C01BZ0TSDNX",
    thread_ts="타임스탬프"
)
```

### 프로덕션 DB 조회

```python
import pymysql
conn = pymysql.connect(
    host='careerly-v2-prod-db.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com',
    user='admin',
    password='RugAdWJ1E9Bc2xydytIl',
    database='careerly_v2'
)
```

---

## 📋 자주 묻는 컨텍스트

### Q: 인프라 접속이 안 돼요
→ IP 변경됐을 가능성. 보안그룹에 현재 IP 추가:
```bash
MY_IP=$(curl -s ifconfig.me)
aws ec2 authorize-security-group-ingress --profile dev_careerly \
  --group-id sg-0f1e71089397d1280 \
  --protocol tcp --port 3306 --cidr ${MY_IP}/32
```

### Q: 오늘 회의 내용 알려줘
→ Slack #공식-회의록 오늘자 검색

### Q: 왜 이렇게 결정했지?
→ Slack 키워드 검색 → 관련 스레드 조회 → 의사결정 맥락 추출

### Q: 서버 어떻게 실행해?
→ 위 서버 구성 표 참조

### Q: CloudWatch 알람 떴어
→ AWS CLI로 상태 확인:
```bash
aws elbv2 describe-target-health --profile dev_careerly --region ap-northeast-2 \
  --target-group-arn "arn:aws:elasticloadbalancing:ap-northeast-2:809714376527:targetgroup/careerly-v2-tg/babe8acd6969cb21"
```

---

## 🏷️ 활성화 키워드

자동 활성화 트리거:
- "커리어리" + 질문
- "회의록", "회의 내용"
- "인프라", "AWS", "RDS", "서버"
- "왜", "결정", "이유"
- "슬랙에서", "채널"
- "에러", "알람", "unhealthy"

---

## 📁 컨텍스트 히스토리

### 자동 저장 (Hook)
- seeso/ 하위 프로젝트에서 모든 프롬프트 자동 저장
- 위치: `~/.claude/plugins/careerly-context/data/history/`

### 카테고리
| 카테고리 | 키워드 |
|----------|--------|
| `prompt` | 프롬프트, 명령 |
| `decision` | 결정, 선택 |
| `issue` | 에러, 버그, 문제 |
| `solution` | 해결, 수정 |
| `meeting` | 회의, 미팅 |

---

## 🔗 관련 MCP

| MCP | 용도 |
|-----|------|
| `slack` | 회의록, 대화 검색 |
| `supabase` | DB 쿼리 |
| `careerly-ga4` | GA4/BigQuery |
