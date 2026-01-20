# Careerly Context Plugin

> 커리어리 프로젝트의 '기억'을 담당하는 컨텍스트 플러그인

## Prerequisites (필수 설정)

이 플러그인 사용 전 **반드시** 아래 설정이 완료되어야 합니다.

### 1. Slack MCP (회의록 검색용)

```bash
# Claude Code 설정에 Slack MCP 추가
# ~/.claude/settings.json 또는 프로젝트 .claude/settings.json
```

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

Slack 토큰 발급: [Slack API](https://api.slack.com/apps) → Bot Token Scopes 필요:
- `channels:history`, `channels:read`, `search:read`, `users:read`

### 2. Supabase MCP (DB 조회용)

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

### 3. Google Sheets MCP (Looply 연동용)

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

Google Cloud Console에서 서비스 계정 생성 후 JSON 키 다운로드 필요.

### 4. AWS CLI (인프라 정보용)

```bash
# AWS CLI 설치
brew install awscli

# careerly 프로필 설정
aws configure --profile dev_careerly
# Access Key, Secret Key, Region (ap-northeast-2) 입력
```

## Installation (플러그인 설치)

```bash
# 1. 마켓플레이스 추가 (최초 1회)
/plugin marketplace add SeeSoRuFree/seeso-marketplace

# 2. 플러그인 설치
/plugin install careerly-context@seeso
```

## Commands

| 명령어 | 설명 | 필요 MCP |
|--------|------|----------|
| `/careerly-context:search [질문]` | 통합 컨텍스트 검색 | Slack, Supabase |
| `/careerly-context:meeting [키워드]` | 회의록 검색 | **Slack** |
| `/careerly-context:infra` | 인프라 정보 조회 | **AWS CLI** |
| `/careerly-context:decision [질문]` | 의사결정 추적 | Slack |
| `/careerly-context:save [내용]` | 컨텍스트 히스토리 저장 | - |
| `/careerly-context:history [검색어]` | 저장된 히스토리 검색 | - |

## Data Sources

### Slack Channels
- `#공식-회의록` - 회의록 저장소
- `#커리어리-운영` - 운영 논의
- `#커리어리-제품` - 제품 관련

### AWS Resources
- **RDS Staging**: `careerly-v2-staging-new.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com`
- **RDS Prod**: `careerly-v2-prod-db.cyxuslsiv7yp.ap-northeast-2.rds.amazonaws.com`
- **Profile**: `dev_careerly`

### Local Directories
- `/careerly-v2/` - 프론트엔드 (Next.js)
- `/careerly2-backend/` - 백엔드 (Django)
- `/agent-poc/` - AI 에이전트 POC

## Troubleshooting

### "Slack MCP not found"
→ Slack MCP 설정 확인, 토큰 권한 확인

### "AWS credentials not found"
→ `aws configure --profile dev_careerly` 실행

### "Google Sheets permission denied"
→ 서비스 계정 이메일을 스프레드시트에 공유

## Version

- 1.0.0 - 초기 버전
