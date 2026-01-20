# 컨텍스트 히스토리 저장

프로젝트에서 사용한 프롬프트, 의사결정, 컨텍스트를 저장합니다.

## 사용법

```
/careerly-context:save [내용]
```

## 저장 프로세스

### Step 1: 메타데이터 수집

저장할 컨텍스트: $ARGUMENTS

다음 정보를 자동 수집:
- **timestamp**: 현재 시간 (ISO 8601)
- **author**: 현재 사용자
- **project**: 현재 프로젝트 경로
- **session_id**: 현재 세션 ID (있으면)

### Step 2: 카테고리 분류

내용을 분석하여 자동 분류:
- `prompt` - 사용한 프롬프트
- `decision` - 의사결정 기록
- `context` - 일반 컨텍스트
- `issue` - 이슈/문제
- `solution` - 해결책
- `meeting` - 회의 관련

### Step 3: 로컬 파일 저장

저장 위치: `~/.claude/plugins/careerly-context/data/history/`

파일명 형식: `YYYY-MM-DD_HHmmss_{category}.json`

```json
{
  "id": "uuid",
  "timestamp": "2026-01-19T12:00:00Z",
  "category": "prompt",
  "content": "저장할 내용",
  "tags": ["자동추출태그"],
  "author": "사용자",
  "project": "careerly-perflexity",
  "metadata": {
    "session_id": "xxx",
    "related_files": [],
    "slack_ref": null
  }
}
```

### Step 4: 확인 메시지

```markdown
✅ 컨텍스트 저장 완료

- **ID**: {id}
- **카테고리**: {category}
- **태그**: {tags}
- **저장 위치**: {file_path}

나중에 검색: `/careerly-context:history {keyword}`
```

## 실행 코드

```python
import json
import os
from datetime import datetime
import uuid

# 저장 디렉토리
HISTORY_DIR = os.path.expanduser("~/.claude/plugins/careerly-context/data/history")

# 현재 시간
now = datetime.now()
timestamp = now.isoformat()
date_str = now.strftime("%Y-%m-%d_%H%M%S")

# UUID 생성
entry_id = str(uuid.uuid4())[:8]

# 카테고리 자동 분류 (키워드 기반)
content = "$ARGUMENTS"
category = "context"  # 기본값

if any(word in content for word in ["프롬프트", "prompt", "명령"]):
    category = "prompt"
elif any(word in content for word in ["결정", "선택", "decision"]):
    category = "decision"
elif any(word in content for word in ["이슈", "문제", "버그", "에러"]):
    category = "issue"
elif any(word in content for word in ["해결", "수정", "fix"]):
    category = "solution"
elif any(word in content for word in ["회의", "미팅", "meeting"]):
    category = "meeting"

# 데이터 구조
entry = {
    "id": entry_id,
    "timestamp": timestamp,
    "category": category,
    "content": content,
    "tags": [],  # 추출된 태그
    "author": os.environ.get("USER", "unknown"),
    "project": os.path.basename(os.getcwd()),
    "metadata": {}
}

# 파일 저장
filename = f"{date_str}_{category}_{entry_id}.json"
filepath = os.path.join(HISTORY_DIR, filename)

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(entry, f, ensure_ascii=False, indent=2)

print(f"저장 완료: {filepath}")
```

## 태그 자동 추출

내용에서 다음 패턴으로 태그 추출:
- `#태그` 형식
- 주요 키워드 (커리어리, MCP, 인프라 등)
- 파일명/경로 언급

## Supabase 마이그레이션 대비

로컬 JSON 구조는 향후 Supabase 테이블과 1:1 매핑:

```sql
CREATE TABLE context_history (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ,
  category TEXT,
  content TEXT,
  tags TEXT[],
  author TEXT,
  project TEXT,
  metadata JSONB
);
```
