# seeso-ccc

> CCC(Context Collector Channel) 워크플로우 플러그인. Claude Code 세션과 슬랙 CCC 채널을 잇는 심리스 워크플로우.

## 개념

- **CCC 채널** = 슬랙에서 `#ccc-{프로젝트}` 형태의 채널
- **세션은 휘발되지만 슬랙은 남는다** — 슬랙이 세션 간 브릿지
- **쓰레드 = 작업 단위** — 하나의 쓰레드가 하나의 작업 생명주기

## Commands

| 명령어 | 설명 |
|--------|------|
| `/seeso-ccc:read [채널]` | CCC 채널 컨텍스트 읽기. 진행 중 작업, 내가 봐야 할 것 요약. |
| `/seeso-ccc:share [채널]` | 현재 작업을 CCC 채널에 공유. [기록] 또는 [액션] 자동 판단. |
| `/seeso-ccc:handoff [채널]` | 세션 종료 시 핸드오프 메시지. 완료/다음/참고 포함. |

## 메시지 3종

- **[기록]** — 컨텍스트 저장. 응답 불필요.
- **[액션]** — @멘션 포함. 사람 응답 필요.
- **[핸드오프]** — 세션/사람 간 인계. 완료/다음/참고 포함.

## 규칙

- 텍스트만 (이미지 금지 — MCP가 못 읽음)
- 500자 이내 권장
- 기존 쓰레드 있으면 이어쓰기

## Prerequisites

- Slack MCP 연결 필요 (`conversations_history`, `conversations_add_message` 등)

## Installation

```bash
claude --plugin-dir ./plugins/seeso-ccc
```

## Version

- 0.1.0 - 초기 버전
