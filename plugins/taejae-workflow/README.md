# taejae-workflow

태재대학교 입학처 웹사이트 유지보수를 위한 워크플로우 자동화 플러그인입니다.

## 기능

- 고객 요청 파일 분석 (PPT, 이미지, 텍스트)
- Notion 티켓 자동 생성 및 관리
- 난이도/배포가능/타입 자동 분류
- 5단계 체크포인트 워크플로우
- 배포 통보 이메일 초안 생성

## 워크플로우 개요

```
[1] 요청 수집 → [2] 티켓 생성 → [3] 분류/검토 → [4] 로컬 개발 → [5] 배포/통보
    (파일분석)     (Notion저장)    (난이도분류)     (코드수정)      (메일초안)
        ↓              ↓              ↓              ↓              ↓
    사용자확인      고객관점검토    개발팀검토     변경사항설명    메일확인
```

## 설치

### 1. 마켓플레이스 추가 (최초 1회)

```bash
/plugin marketplace add SeeSoRuFree/seeso-marketplace
```

### 2. 플러그인 설치

```bash
/plugin install taejae-workflow@seeso
```

## 사용법

### 전체 워크플로우 시작

```bash
/taejae-workflow:workflow start ~/Downloads/고객요청.pptx
```

### 개별 명령어

| 명령어 | 설명 |
|--------|------|
| `/taejae-workflow:workflow` | 워크플로우 도움말 및 상태 확인 |
| `/taejae-workflow:workflow start <파일>` | 새 워크플로우 시작 |
| `/taejae-workflow:ticket` | Notion 티켓 관리 |
| `/taejae-workflow:ticket create` | 새 티켓 생성 |
| `/taejae-workflow:deploy-notify` | 배포 통보 메일 초안 작성 |

## 사용자 확인 포인트 (Checkpoints)

각 단계 완료 후 사용자 확인을 요청합니다:

| 체크포인트 | 확인 내용 | 사용자 액션 |
|-----------|----------|------------|
| CHECKPOINT-1 | 분석된 요청 목록 | 확인/추가요청 |
| CHECKPOINT-2 | 생성된 티켓 + 고객 검토 결과 | 승인/수정요청 |
| CHECKPOINT-3 | 분류 결과 + 개발팀 검토 | 확인/재분류 |
| CHECKPOINT-4 | 변경사항 설명 + 로컬 확인 요청 | 배포/수정필요 |
| CHECKPOINT-5 | 고객 통보 메일 초안 | 확인(수동복사) |

## 필수 조건

### Notion MCP 연동

티켓 관리를 위해 Notion MCP가 연결되어 있어야 합니다:

```bash
# MCP 도구 확인
mcp__notion__API-post-page
mcp__notion__API-patch-page
mcp__notion__API-query-data-source
```

### 프로젝트 설정

`.workflow/config.json` 파일에 설정:

```json
{
  "notion": {
    "database_id": "YOUR_NOTION_DATABASE_ID"
  },
  "dev": {
    "port": 7987
  },
  "deploy": {
    "method": "ftp"
  },
  "notify": {
    "sender_name": "웹사이트 관리팀",
    "default_recipient": "입학처 담당자님"
  }
}
```

## 프로젝트 자동 설정

프로젝트의 `.claude/settings.json`에 추가:

```json
{
  "extraKnownMarketplaces": {
    "seeso": {
      "source": {
        "source": "github",
        "repo": "SeeSoRuFree/seeso-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "taejae-workflow@seeso": true
  }
}
```

## 라이선스

MIT
