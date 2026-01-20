# Looply 이슈/티켓 관리 스킬

> Google Sheets 기반 사내 이슈 트래커

## Spreadsheet 정보

- **ID**: `1_GJH82C25hgO9eZPrews32rbd4ZynmpXDhVcSl3svHA`
- **이름**: Looply_db

## 테이블 구조

### releases (릴리즈)
| 컬럼 | 설명 | 값 예시 |
|------|------|---------|
| id | PK | chdyyx22nmk0vvnd6 |
| version | 버전명 | 커리어리-v0.0.1 |
| status | 상태 | planning / in_progress / released |
| targetDate | 목표일 | 2026-01-11 |
| createdBy | 생성자 | mark |

### stories (스토리)
| 컬럼 | 설명 |
|------|------|
| id | PK |
| storyNumber | 번호 |
| title | 제목 |
| description | 설명 |

### story_tickets (티켓)
| 컬럼 | 설명 |
|------|------|
| id | PK |
| storyId | FK → stories |
| releaseId | FK → releases |
| ticketIndex | 순번 |
| title | 제목 |
| asIs | 현재 상태 |
| toBe | 목표 상태 |
| status | submitted / confirmed / in_progress / done |
| assigneeId | 담당자 (jingyu, mark, admin) |
| platforms | ["common"] / ["web"] / ["ios"] / ["android"] |

### internal_issues (내부 이슈)
| 컬럼 | 설명 |
|------|------|
| id | PK |
| issueNumber | 번호 |
| type | idea / bug / improvement |
| status | submitted / in_progress / done |
| priority | low / medium / high / critical |
| asIs / toBe | 현재/목표 상태 |

### Feedbacks, Tasks, Comments
- 외부 피드백 및 연관 태스크/댓글

## MCP 사용법

### 조회
```
mcp__google-sheets__get_sheet_data
- spreadsheet_id: "1_GJH82C25hgO9eZPrews32rbd4ZynmpXDhVcSl3svHA"
- sheet: "story_tickets" (또는 releases, stories 등)
```

### 수정
```
mcp__google-sheets__update_cells
- spreadsheet_id: 위와 동일
- sheet: 시트명
- range: "A2:B2" (수정할 셀)
- data: [["값1", "값2"]]
```

## 담당자 매핑

| ID | 이름 |
|----|------|
| jingyu | 진규 |
| mark | 마크 |
| admin | 관리자 |

## 활성화 키워드

- looply, 루플리
- 릴리즈, release
- 티켓, ticket
- 이슈, issue
- 스토리, story
- 진규 티켓, 마크 티켓
- 진행중인 작업

## 자주 묻는 질문 패턴

| 질문 | 시트 | 필터 |
|------|------|------|
| 현재 릴리즈? | releases | status = in_progress |
| 진규 티켓? | story_tickets | assigneeId = jingyu |
| v0.0.1 작업 목록? | story_tickets | releaseId로 필터 |
| 미해결 이슈? | internal_issues | status != done |
| 버그 목록? | internal_issues | type = bug |
