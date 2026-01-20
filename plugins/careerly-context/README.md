# Careerly Context Plugin

> 커리어리 프로젝트의 '기억'을 담당하는 컨텍스트 플러그인

## 목적

커리어리 프로젝트를 진행하면서 발생하는 **모든 컨텍스트를 한 곳에서 관리**하기 위한 플러그인입니다.

### 해결하는 문제

| 문제 | 해결 |
|------|------|
| "그때 회의에서 뭐라고 했더라?" | Slack 회의록 통합 검색 |
| "RDS 엔드포인트가 뭐였지?" | 인프라 정보 즉시 조회 |
| "왜 이렇게 결정했더라?" | 의사결정 히스토리 추적 |
| "진규 담당 티켓 뭐 있어?" | Looply 이슈/티켓 조회 |
| "지난번 작업 내용이 뭐였지?" | 프롬프트 히스토리 자동 저장 |

### 대상 사용자

- 커리어리 프로젝트 개발자
- 커리어리 프로젝트 PM/PO
- 인프라 담당자

## 작동 방식

### 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                 careerly-context 플러그인                 │
├─────────────────────────────────────────────────────────┤
│  Skills (자동 활성화)           Commands (명시적 호출)     │
│  ├── careerly-context/         ├── /search              │
│  └── looply/                   ├── /meeting             │
│                                ├── /infra               │
│                                ├── /decision            │
│                                ├── /looply              │
│                                ├── /save                │
│                                └── /history             │
├─────────────────────────────────────────────────────────┤
│                        MCP 연동                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Slack   │  │ Supabase │  │  Google  │  │   AWS   │  │
│  │   MCP    │  │   MCP    │  │  Sheets  │  │   CLI   │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
│       ↓              ↓              ↓            ↓       │
│   회의록         DB 스키마      Looply       인프라      │
│   대화 검색      데이터 조회    티켓/이슈    RDS/ALB    │
└─────────────────────────────────────────────────────────┘
```

### Skills vs Commands

| 유형 | 활성화 방식 | 용도 |
|------|------------|------|
| **Skills** | 키워드 감지 시 자동 | 컨텍스트 제공, 백그라운드 지식 |
| **Commands** | `/명령어`로 명시적 호출 | 특정 작업 수행 |

**Skills 자동 활성화 키워드:**
- `커리어리`, `careerly`, `회의록`, `인프라`, `RDS`, `AWS`
- `looply`, `루플리`, `릴리즈`, `티켓`, `이슈`

### 데이터 흐름

```
1. 사용자 질문: "진규 담당 티켓 뭐 있어?"
        ↓
2. Skills 활성화: looply 스킬이 키워드 감지
        ↓
3. MCP 호출: Google Sheets MCP → story_tickets 시트 조회
        ↓
4. 필터링: assigneeId = "jingyu" 인 행 추출
        ↓
5. 응답: 티켓 목록 포맷팅하여 반환
```

### 프롬프트 자동 저장 (Hooks)

이 플러그인은 **UserPromptSubmit 훅**을 통해 커리어리 관련 프로젝트에서의 모든 프롬프트를 자동 저장합니다.

```
저장 위치: ~/.claude/plugins/careerly-context/data/history/
파일명: {날짜}_{시간}_{카테고리}_{해시}.json

카테고리 자동 분류:
- prompt: 일반 질문
- decision: 의사결정 ("왜", "결정", "선택" 포함)
- issue: 이슈/에러 ("에러", "버그", "문제" 포함)
- solution: 해결책 ("해결", "수정", "fix" 포함)
- meeting: 회의 ("회의", "미팅" 포함)
```

## 기능 상세

### 1. 회의록 검색 (`/meeting`)

Slack의 회의록 채널에서 키워드로 검색합니다.

```bash
/careerly-context:meeting AI 에이전시
/careerly-context:meeting 1월 19일 회의
```

**검색 대상 채널:**
- `#공식-회의록`
- `#커리어리-운영`
- `#커리어리-제품`

### 2. 인프라 정보 조회 (`/infra`)

AWS 리소스 정보를 즉시 확인합니다.

```bash
/careerly-context:infra
/careerly-context:infra rds
/careerly-context:infra alb
```

**조회 가능 정보:**
| 리소스 | 정보 |
|--------|------|
| RDS | 엔드포인트, 상태, 인스턴스 타입 |
| ALB | Target Group 상태, Health Check |
| EC2 | 인스턴스 상태, IP |
| CloudWatch | 알람 상태 |

### 3. Looply 이슈/티켓 관리 (`/looply`)

Google Sheets 기반 사내 이슈 트래커를 조회/관리합니다.

```bash
# 릴리즈 목록
/careerly-context:looply releases

# 티켓 조회
/careerly-context:looply tickets
/careerly-context:looply tickets @jingyu
/careerly-context:looply tickets --status=in_progress

# 이슈 조회
/careerly-context:looply issues
/careerly-context:looply issues --type=bug
```

**Looply 시트 구조:**

| 시트 | 용도 | 주요 필드 |
|------|------|----------|
| **releases** | 릴리즈 관리 | version, targetDate, status |
| **stories** | 스토리/에픽 | storyNumber, title, description |
| **story_tickets** | 세부 티켓 | asIs, toBe, assigneeId, releaseId, status |
| **internal_issues** | 내부 이슈 | type, priority, asIs, toBe |
| **Feedbacks** | 외부 피드백 | ticketNumber, type, votes |
| **Tasks** | 태스크 | feedbackIds, priority, dueDate |
| **Comments** | 댓글 | feedbackId, content, isTeamResponse |

**담당자 ID 매핑:**
| ID | 이름 |
|----|------|
| jingyu | 진규 |
| mark | 마크 |
| admin | 관리자 |

**상태 흐름:**
```
릴리즈: planning → in_progress → released
티켓:   submitted → confirmed → in_progress → done
이슈:   submitted → in_progress → done
```

### 4. 의사결정 추적 (`/decision`)

과거 의사결정의 배경과 이유를 추적합니다.

```bash
/careerly-context:decision 왜 카카오 로그인을 선택했지?
/careerly-context:decision MCP 도입 배경
```

### 5. 컨텍스트 저장/조회 (`/save`, `/history`)

수동으로 중요한 컨텍스트를 저장하고 나중에 검색합니다.

```bash
# 저장
/careerly-context:save 오늘 결정: 푸시 알림은 FCM으로 통일

# 조회
/careerly-context:history 푸시 알림
/careerly-context:history --category=decision
```

## Prerequisites (필수 설정)

### 1. Slack MCP

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "SLACK_TEAM_ID": "T0XXXXXXX"
      }
    }
  }
}
```

**필요 권한:** `channels:history`, `channels:read`, `search:read`, `users:read`

### 2. Supabase MCP

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-supabase"],
      "env": {
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### 3. Google Sheets MCP

```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-google-sheets"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
      }
    }
  }
}
```

**추가 설정:** 서비스 계정 이메일을 Looply 스프레드시트에 **편집자** 권한으로 공유

### 4. AWS CLI

```bash
brew install awscli
aws configure --profile dev_careerly
```

## Installation

```bash
# 1. 마켓플레이스 추가 (최초 1회)
/plugin marketplace add SeeSoRuFree/seeso-marketplace

# 2. 플러그인 설치
/plugin install careerly-context@seeso

# 3. 업데이트 (새 버전 출시 시)
/plugin update careerly-context@seeso
```

## Data Sources 요약

| 소스 | MCP | 용도 |
|------|-----|------|
| Slack | slack | 회의록, 대화 검색 |
| Supabase | supabase | DB 스키마, 데이터 조회 |
| Looply (Google Sheets) | google-sheets | 이슈/티켓 관리 |
| AWS | CLI | 인프라 상태 조회 |
| 로컬 파일 | - | CLAUDE.md, 프로젝트 문서 |

**주요 리소스:**
- **RDS Staging**: `careerly-v2-staging-new.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com`
- **RDS Prod**: `careerly-v2-prod-db.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com`
- **Looply Sheet ID**: `1_GJH82C25hgO9eZPrews32rbd4ZynmpXDhVcSl3svHA`
- **AWS Profile**: `dev_careerly`

## Troubleshooting

| 에러 | 원인 | 해결 |
|------|------|------|
| Slack MCP not found | MCP 미설정 | settings.json에 Slack MCP 추가 |
| AWS credentials not found | 프로필 미설정 | `aws configure --profile dev_careerly` |
| Google Sheets permission denied | 공유 안됨 | 서비스 계정 이메일을 시트에 공유 |
| Looply 데이터 조회 안됨 | Sheet ID 오류 | Spreadsheet ID 확인 |

## Version History

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.1.0 | 2026-01-20 | Looply 이슈/티켓 관리 기능 추가 |
| 1.0.0 | 2026-01-19 | 초기 버전 (Slack, 인프라, 히스토리) |

## Contributing

버그 리포트나 기능 제안은 [seeso-marketplace](https://github.com/SeeSoRuFree/seeso-marketplace) 레포지토리에 이슈로 등록해주세요.

## License

MIT
