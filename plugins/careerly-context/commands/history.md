# 컨텍스트 히스토리 검색

저장된 프롬프트, 의사결정, 컨텍스트를 검색합니다.

## 사용법

```
/careerly-context:history [검색어]
```

옵션:
- 키워드 검색: `/careerly-context:history MCP`
- 카테고리 필터: `/careerly-context:history category:decision`
- 날짜 필터: `/careerly-context:history date:2026-01-19`
- 최근 N개: `/careerly-context:history recent:5`

## 검색 프로세스

### Step 1: 히스토리 파일 로드

검색어: $ARGUMENTS

저장 위치: `~/.claude/plugins/careerly-context/data/history/`

```python
import os
import json
from glob import glob

HISTORY_DIR = os.path.expanduser("~/.claude/plugins/careerly-context/data/history")

# 모든 히스토리 파일 로드
history_files = glob(os.path.join(HISTORY_DIR, "*.json"))
entries = []

for filepath in history_files:
    with open(filepath, "r", encoding="utf-8") as f:
        entry = json.load(f)
        entry["_filepath"] = filepath
        entries.append(entry)

# 시간순 정렬 (최신순)
entries.sort(key=lambda x: x["timestamp"], reverse=True)
```

### Step 2: 검색 필터 적용

```python
query = "$ARGUMENTS"
results = []

# 파싱
if query.startswith("category:"):
    category = query.split(":")[1]
    results = [e for e in entries if e["category"] == category]
elif query.startswith("date:"):
    date = query.split(":")[1]
    results = [e for e in entries if e["timestamp"].startswith(date)]
elif query.startswith("recent:"):
    n = int(query.split(":")[1])
    results = entries[:n]
else:
    # 키워드 검색
    results = [e for e in entries if query.lower() in e["content"].lower()]
```

### Step 3: 결과 출력

```markdown
## 컨텍스트 히스토리 검색 결과: "[검색어]"

### 검색 결과 (X건)

**1. [{category}] {timestamp}**
- ID: {id}
- 프로젝트: {project}
- 내용:
  ```
  {content}
  ```
- 태그: {tags}

**2. [{category}] {timestamp}**
...

### 통계
- 전체 저장 건수: X
- 카테고리별:
  - prompt: X
  - decision: X
  - context: X
```

## 출력 형식

### 단일 결과

```markdown
## 컨텍스트: {id}

- **저장일**: {timestamp}
- **카테고리**: {category}
- **프로젝트**: {project}
- **작성자**: {author}

### 내용
{content}

### 태그
{tags}

### 관련 정보
- 파일: {metadata.related_files}
- 슬랙 참조: {metadata.slack_ref}
```

### 목록 결과

```markdown
## 히스토리 검색 결과

| # | 날짜 | 카테고리 | 내용 (요약) | 태그 |
|---|------|----------|-------------|------|
| 1 | 2026-01-19 | prompt | 커리어리 인프라... | #인프라 |
| 2 | 2026-01-18 | decision | MCP 도입 결정... | #MCP |
```

## 고급 검색

### 복합 조건

```
/careerly-context:history category:decision MCP
→ 카테고리가 decision이면서 MCP 포함

/careerly-context:history date:2026-01 인프라
→ 2026년 1월 중 "인프라" 포함
```

### 전체 목록

```
/careerly-context:history all
→ 전체 히스토리 (최신순)
```

### 통계

```
/careerly-context:history stats
→ 카테고리별, 날짜별 통계
```

## Supabase 마이그레이션 시

로컬 검색 → SQL 쿼리로 전환:

```sql
-- 키워드 검색
SELECT * FROM context_history
WHERE content ILIKE '%MCP%'
ORDER BY timestamp DESC;

-- 카테고리 필터
SELECT * FROM context_history
WHERE category = 'decision'
ORDER BY timestamp DESC;

-- 날짜 필터
SELECT * FROM context_history
WHERE timestamp::date = '2026-01-19';
```
