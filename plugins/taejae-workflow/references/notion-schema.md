# Notion 데이터베이스 스키마 상세

## 데이터베이스 설정

### 기본 정보

- **데이터베이스 이름**: 태재 입학처 업무 티켓
- **아이콘**: 🎫
- **설명**: 태재대학교 입학처 웹사이트 유지보수 티켓 관리

---

## 속성 (Properties) 상세

### 1. 제목 (Title) - 필수

```json
{
  "name": "제목",
  "type": "title",
  "title": {}
}
```

**사용법**:
```json
{
  "제목": {
    "title": [
      {
        "type": "text",
        "text": {
          "content": "메인 배너 이미지 교체"
        }
      }
    ]
  }
}
```

**형식 규칙**:
- `[타입] 요약` 형태 권장
- 예: `[콘텐츠] 메인 배너 이미지 교체`
- 최대 100자

---

### 2. 상태 (Status) - 필수

```json
{
  "name": "상태",
  "type": "select",
  "select": {
    "options": [
      { "name": "대기", "color": "gray" },
      { "name": "진행중", "color": "blue" },
      { "name": "완료", "color": "green" },
      { "name": "보류", "color": "yellow" }
    ]
  }
}
```

**사용법**:
```json
{
  "상태": {
    "select": {
      "name": "대기"
    }
  }
}
```

---

### 3. 난이도 (Difficulty) - 필수

```json
{
  "name": "난이도",
  "type": "select",
  "select": {
    "options": [
      { "name": "쉬움", "color": "green" },
      { "name": "보통", "color": "yellow" },
      { "name": "어려움", "color": "red" }
    ]
  }
}
```

---

### 4. 타입 (Type) - 필수

```json
{
  "name": "타입",
  "type": "select",
  "select": {
    "options": [
      { "name": "콘텐츠", "color": "purple" },
      { "name": "프론트엔드", "color": "blue" },
      { "name": "백엔드", "color": "orange" },
      { "name": "복합", "color": "pink" }
    ]
  }
}
```

---

### 5. 배포가능 (Deployable) - 필수

```json
{
  "name": "배포가능",
  "type": "select",
  "select": {
    "options": [
      { "name": "즉시", "color": "green" },
      { "name": "예정", "color": "blue" },
      { "name": "검토필요", "color": "red" }
    ]
  }
}
```

---

### 6. 우선순위 (Priority) - 필수

```json
{
  "name": "우선순위",
  "type": "select",
  "select": {
    "options": [
      { "name": "높음", "color": "red" },
      { "name": "중간", "color": "yellow" },
      { "name": "낮음", "color": "gray" }
    ]
  }
}
```

---

### 7. 요청일 (Request Date) - 필수

```json
{
  "name": "요청일",
  "type": "date",
  "date": {}
}
```

**사용법**:
```json
{
  "요청일": {
    "date": {
      "start": "2025-01-30"
    }
  }
}
```

---

### 8. 완료일 (Completion Date) - 선택

```json
{
  "name": "완료일",
  "type": "date",
  "date": {}
}
```

---

### 9. 영향범위 (Affected Areas) - 선택

```json
{
  "name": "영향범위",
  "type": "multi_select",
  "multi_select": {
    "options": [
      { "name": "메인페이지", "color": "blue" },
      { "name": "입학안내", "color": "green" },
      { "name": "모집요강", "color": "yellow" },
      { "name": "일정안내", "color": "orange" },
      { "name": "FAQ", "color": "purple" },
      { "name": "문의", "color": "pink" },
      { "name": "헤더", "color": "gray" },
      { "name": "푸터", "color": "brown" }
    ]
  }
}
```

**사용법**:
```json
{
  "영향범위": {
    "multi_select": [
      { "name": "메인페이지" },
      { "name": "헤더" }
    ]
  }
}
```

---

### 10. 요청내용 (Description) - 선택

```json
{
  "name": "요청내용",
  "type": "rich_text",
  "rich_text": {}
}
```

**사용법**:
```json
{
  "요청내용": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "메인 페이지 상단 배너의 3번째 슬라이드 이미지를 첨부 파일의 이미지로 교체해주세요."
        }
      }
    ]
  }
}
```

---

### 11. 메모 (Notes) - 선택

```json
{
  "name": "메모",
  "type": "rich_text",
  "rich_text": {}
}
```

---

## 페이지 본문 블록 구조

### 기본 구조

```json
{
  "children": [
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [{ "type": "text", "text": { "content": "요청 상세" } }]
      }
    },
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [{ "type": "text", "text": { "content": "상세 내용..." } }]
      }
    },
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [{ "type": "text", "text": { "content": "작업 체크리스트" } }]
      }
    },
    {
      "object": "block",
      "type": "to_do",
      "to_do": {
        "rich_text": [{ "type": "text", "text": { "content": "파일 교체" } }],
        "checked": false
      }
    },
    {
      "object": "block",
      "type": "to_do",
      "to_do": {
        "rich_text": [{ "type": "text", "text": { "content": "로컬 확인" } }],
        "checked": false
      }
    }
  ]
}
```

---

## MCP API 사용 예시

### 티켓 생성 (mcp__notion__API-post-page)

```json
{
  "parent": {
    "database_id": "DATABASE_ID_HERE"
  },
  "properties": {
    "제목": {
      "title": [{ "text": { "content": "[콘텐츠] 메인 배너 이미지 교체" } }]
    },
    "상태": { "select": { "name": "대기" } },
    "난이도": { "select": { "name": "쉬움" } },
    "타입": { "select": { "name": "콘텐츠" } },
    "배포가능": { "select": { "name": "즉시" } },
    "우선순위": { "select": { "name": "높음" } },
    "요청일": { "date": { "start": "2025-01-30" } },
    "영향범위": { "multi_select": [{ "name": "메인페이지" }] },
    "요청내용": {
      "rich_text": [{ "text": { "content": "배너 이미지 교체 요청" } }]
    }
  },
  "children": [
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [{ "text": { "content": "요청 상세" } }]
      }
    },
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [{ "text": { "content": "메인 페이지 상단 배너의 3번째 이미지 교체" } }]
      }
    }
  ]
}
```

### 티켓 업데이트 (mcp__notion__API-patch-page)

```json
{
  "page_id": "PAGE_ID_HERE",
  "properties": {
    "상태": { "select": { "name": "완료" } },
    "완료일": { "date": { "start": "2025-01-30" } }
  }
}
```

### 티켓 조회 (mcp__notion__API-query-data-source)

```json
{
  "database_id": "DATABASE_ID_HERE",
  "filter": {
    "and": [
      {
        "property": "상태",
        "select": { "equals": "대기" }
      },
      {
        "property": "우선순위",
        "select": { "equals": "높음" }
      }
    ]
  },
  "sorts": [
    {
      "property": "요청일",
      "direction": "descending"
    }
  ]
}
```

---

## 데이터베이스 ID 설정

### 환경 설정 파일

`.workflow/config.json`:
```json
{
  "notion": {
    "database_id": "YOUR_DATABASE_ID",
    "api_version": "2022-06-28"
  }
}
```

### 데이터베이스 ID 찾기

1. Notion에서 데이터베이스 페이지 열기
2. URL에서 ID 추출:
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=...
   ```
3. `DATABASE_ID` 부분이 32자 hex 문자열

---

## 뷰 (Views) 설정 권장

### 1. 대시보드 뷰 (Board)

- 그룹: 상태
- 필터: 없음
- 정렬: 우선순위 → 요청일

### 2. 대기 목록 뷰 (Table)

- 필터: 상태 = 대기
- 정렬: 우선순위 (높음 우선)
- 표시 열: 제목, 난이도, 타입, 우선순위, 요청일

### 3. 완료 목록 뷰 (Table)

- 필터: 상태 = 완료
- 정렬: 완료일 (최신 우선)
- 표시 열: 제목, 타입, 요청일, 완료일
