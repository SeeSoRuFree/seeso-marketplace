---
description: Notion 티켓 생성 및 관리
---

# Ticket Command

태재대학교 입학처 웹사이트 유지보수 티켓을 Notion에서 관리하는 명령어입니다.

## 사용법

```bash
/ticket                          # 도움말
/ticket create                   # 새 티켓 생성 (대화형)
/ticket create --from-analysis   # 분석 결과에서 티켓 생성
/ticket list                     # 티켓 목록 조회
/ticket update <ID>              # 티켓 업데이트
/ticket classify <ID>            # 티켓 난이도/타입 분류
```

## 스킬 참조

이 명령어를 실행하면 다음 스킬이 호출됩니다:
- `skills/taejae-ticket-manager/SKILL.md`

## 티켓 속성

| 속성 | 타입 | 옵션 |
|------|------|------|
| 제목 | title | - |
| 상태 | select | 대기, 진행중, 완료, 보류 |
| 난이도 | select | 쉬움, 보통, 어려움 |
| 타입 | select | 프론트엔드, 백엔드, 콘텐츠, 복합 |
| 배포가능 | select | 즉시, 예정, 검토필요 |
| 우선순위 | select | 높음, 중간, 낮음 |

## 난이도 분류 기준

- **쉬움**: 단순 콘텐츠 교체, 1개 파일 수정
- **보통**: 여러 파일 수정, 스타일 변경
- **어려움**: 로직 변경, 새 기능 추가

## 필수 조건

Notion MCP가 연결되어 있어야 합니다:

```
mcp__notion__API-post-page
mcp__notion__API-patch-page
mcp__notion__API-query-data-source
```

## 예시

```bash
# 분석된 요청에서 티켓 생성
/ticket create --from-analysis

# 특정 티켓 상태 업데이트
/ticket update TICKET-20250130-001 --status 완료

# 대기 중인 티켓 목록
/ticket list --status 대기
```
