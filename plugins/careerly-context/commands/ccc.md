---
description: "커리어리 작업 내용을 #ccc-careerly 채널에 공유한다. seeso-ccc 워크플로우 기반."
---

# CCC 커리어리 채널 공유

현재 작업 내용을 `#ccc-careerly` 채널에 seeso-ccc 워크플로우로 포스팅한다.

## 사용법

```
/careerly-context:ccc [내용 또는 옵션]
```

예시:
- `/careerly-context:ccc` — 현재 세션 작업 자동 요약 후 [기록]으로 공유
- `/careerly-context:ccc 핸드오프` — [핸드오프] 메시지로 세션 인계
- `/careerly-context:ccc @민우 API 스펙 확인 부탁` — [액션] 메시지

## 실행 순서

### 1. 대상 채널 확인
- 채널: `#ccc-careerly`
- Slack MCP `conversations_history`로 채널 존재 확인
- 채널 없으면 사용자에게 알려주고 중단

### 2. 기존 쓰레드 확인
- `#ccc-careerly` 최근 메시지 스캔 (conversations_history, limit: 3d)
- 현재 작업과 관련된 쓰레드가 있는지 확인
  - git branch명, 작업 주제 등으로 매칭
- 관련 쓰레드 있으면 → reply, 없으면 → 새 쓰레드

### 3. 메시지 타입 판단

$ARGUMENTS 분석:

| 조건 | 타입 |
|------|------|
| "핸드오프", "인계", "세션 끝" | `[핸드오프]` |
| "@이름", "부탁", "확인", "리뷰" | `[액션]` |
| 그 외 (기본값) | `[기록]` |

### 4. 메시지 작성

#### [기록] (기본)
```
[기록] {한 줄 요약}

{무엇을 왜 했는지}
- 변경: {파일/커밋 요약}
- 결과: {성공/실패/진행중}
```

#### [액션]
```
[액션] @{담당자} {한 줄 요약}

{필요한 것}
1. {구체적 요청}
```

#### [핸드오프]
```
[핸드오프] {한 줄 요약}

완료: {어디까지}
다음: {뭘 해야 하는지}
참고: {PR, 파일, 주의사항}
```

### 5. Slack MCP로 포스팅
- `conversations_add_message` 사용
- channel_id: `#ccc-careerly`
- thread_ts: 관련 쓰레드 있으면 해당 ts, 없으면 생략 (새 쓰레드)

### 6. 로컬 히스토리에도 저장
- `~/.claude/plugins/careerly-context/data/history/` 에 JSON 저장
- metadata에 `slack_ref` (채널, ts) 추가하여 슬랙 메시지와 연결

## 규칙
- 텍스트만. 이미지/스크린샷 절대 금지.
- 500자 이내. 길면 쓰레드 reply로 분리.
- 코드는 핵심 변경 부분만 발췌.
- "다음" 항목은 구체적으로 (애매한 표현 금지).
