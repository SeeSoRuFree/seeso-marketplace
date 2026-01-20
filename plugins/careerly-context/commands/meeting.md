# 커리어리 회의록 검색

슬랙 #공식-회의록 채널에서 회의 내용을 검색합니다.

## 사용법

```
/careerly-context:meeting [키워드]
```

## 검색 대상 채널

| 채널 | ID | 용도 |
|------|-----|------|
| #공식-회의록 | C01BZ0TSDNX | 회의록 저장소 |
| #커리어리-운영 | (조회) | 운영 논의 |
| #커리어리-제품 | (조회) | 제품 관련 |

## 검색 실행

검색 키워드: $ARGUMENTS

### Step 1: 슬랙 메시지 검색

```
mcp__slack__conversations_search_messages(
    search_query="$ARGUMENTS",
    filter_in_channel="#공식-회의록",
    limit=20
)
```

### Step 2: 관련 스레드 상세 조회

검색 결과에서 thread_ts가 있는 경우:
```
mcp__slack__conversations_replies(
    channel_id="C01BZ0TSDNX",
    thread_ts="[메시지_타임스탬프]"
)
```

### Step 3: 결과 정리

```markdown
## 회의록 검색 결과: "[키워드]"

### 관련 회의 (X건)

**1. [날짜] [회의 제목]**
- 채널: #공식-회의록
- 참석자: @이름, @이름
- 핵심 내용:
  - 포인트 1
  - 포인트 2
- 액션 아이템:
  - [ ] 할 일 1
  - [ ] 할 일 2

**2. [날짜] [회의 제목]**
...
```

## 날짜 필터링

특정 기간 검색 시:
- `filter_date_after`: "YYYY-MM-DD"
- `filter_date_before`: "YYYY-MM-DD"
- `filter_date_during`: "July", "Yesterday", "Today"
