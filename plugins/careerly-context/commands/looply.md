# /careerly-context:looply

Looply 이슈/티켓 관리 시스템 조회 및 관리

## 사용법

```
/careerly-context:looply [명령] [옵션]
```

## 명령어

### 조회
- `releases` - 릴리즈 목록
- `tickets` - 티켓 목록
- `tickets @담당자` - 담당자별 티켓
- `issues` - 내부 이슈 목록
- `stories` - 스토리 목록

### 필터
- `--status=in_progress` - 상태 필터
- `--release=v0.0.1` - 릴리즈 필터
- `--assignee=jingyu` - 담당자 필터

## 실행 방법

Google Sheets MCP를 사용하여 데이터 조회:

```
Spreadsheet ID: 1_GJH82C25hgO9eZPrews32rbd4ZynmpXDhVcSl3svHA

시트별 용도:
- releases: 릴리즈 관리
- stories: 스토리 (에픽)
- story_tickets: 세부 티켓
- internal_issues: 내부 이슈
- Feedbacks: 외부 피드백
- Tasks: 태스크
- Comments: 댓글
```

## 예시

```bash
# 현재 진행중인 릴리즈
/careerly-context:looply releases --status=in_progress

# 진규 담당 티켓
/careerly-context:looply tickets @jingyu

# 미해결 버그
/careerly-context:looply issues --type=bug --status=submitted
```

## 담당자 ID

| ID | 이름 |
|----|------|
| jingyu | 진규 |
| mark | 마크 |
| admin | 관리자 |

## 필요 MCP

- **google-sheets**: Google Sheets MCP 필수
- 스프레드시트 공유 필요: `claude-code-mcp@clear-heaven-464109-m6.iam.gserviceaccount.com`
