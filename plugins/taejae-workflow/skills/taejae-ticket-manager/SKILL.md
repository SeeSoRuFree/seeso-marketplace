# taejae-ticket-manager

태재대학교 입학처 웹사이트 유지보수 티켓을 Notion에서 관리하는 스킬입니다.

## 트리거

- `/ticket` - 티켓 관리 도움말
- `/ticket create` - 새 티켓 생성
- `/ticket create --from-analysis` - 분석 결과에서 티켓 생성
- `/ticket list` - 티켓 목록 조회
- `/ticket update <ID>` - 티켓 업데이트
- `/ticket classify <ID>` - 티켓 난이도/타입 분류

## 개요

Notion MCP를 활용하여 티켓을 관리합니다:
- 분석된 요청을 Notion 티켓으로 변환
- 난이도/배포가능여부/타입 자동 분류
- 티켓 상태 추적 및 업데이트

## Notion 데이터베이스 스키마

### 필수 속성 (Properties)

| 속성명 | 타입 | 설명 | 옵션 |
|--------|------|------|------|
| 제목 | title | 티켓 제목 | - |
| 상태 | select | 작업 상태 | 대기, 진행중, 완료, 보류 |
| 난이도 | select | 작업 난이도 | 쉬움, 보통, 어려움 |
| 타입 | select | 작업 유형 | 프론트엔드, 백엔드, 콘텐츠, 복합 |
| 배포가능 | select | 배포 가능 여부 | 즉시, 예정, 검토필요 |
| 우선순위 | select | 우선순위 | 높음, 중간, 낮음 |
| 요청일 | date | 요청 접수일 | - |
| 완료일 | date | 작업 완료일 | - |

### 선택 속성

| 속성명 | 타입 | 설명 |
|--------|------|------|
| 요청내용 | rich_text | 상세 요청 내용 |
| 영향범위 | multi_select | 영향 받는 페이지/컴포넌트 |
| 담당자 | people | 담당 개발자 |
| 관련파일 | files | 첨부 파일 |
| 메모 | rich_text | 추가 메모 |

## 티켓 생성

### 분석 결과에서 생성

`customer-request-analyzer`의 출력을 입력으로 받아 티켓 생성:

```bash
/ticket create --from-analysis
```

### 수동 생성

대화형으로 티켓 정보 입력:

```bash
/ticket create
```

### 생성 프로세스

1. **정보 수집**
   - 제목 및 설명
   - 카테고리/우선순위
   - 영향 범위

2. **자동 분류**
   - 난이도 추정
   - 배포 가능 여부 판단
   - 타입 분류

3. **Notion 저장**
   - MCP를 통해 Notion DB에 페이지 생성
   - 생성된 티켓 URL 반환

4. **고객 관점 검토**
   - `customer-reviewer` 에이전트 호출
   - 검토 결과 첨부

## 난이도 분류 기준

### 쉬움 (Easy)

**조건**:
- 단순 콘텐츠 교체 (이미지, 텍스트, PDF)
- 1개 파일만 수정
- 로직 변경 없음

**예시**:
- 배너 이미지 교체
- 텍스트 오타 수정
- PDF 파일 업데이트
- 링크 URL 변경

### 보통 (Medium)

**조건**:
- 여러 파일 수정 필요
- 스타일/레이아웃 변경
- 간단한 로직 수정

**예시**:
- 새 섹션 추가
- 레이아웃 변경
- 새 페이지 추가 (템플릿 기반)
- 컴포넌트 스타일 수정

### 어려움 (Hard)

**조건**:
- 복잡한 로직 변경
- 새 기능 구현
- 외부 연동 필요

**예시**:
- 문의 폼 + 이메일 발송
- 검색 기능 구현
- 필터/정렬 기능
- 동적 콘텐츠 구현

## 배포 가능 분류 기준

### 즉시 (Immediate)

**조건**:
- 단순 콘텐츠 변경
- 리스크 낮음
- 롤백 쉬움

**처리**: 개발 완료 후 즉시 배포 가능

### 예정 (Scheduled)

**조건**:
- 중요 변경
- 테스트 필요
- 다른 작업과 함께 배포 권장

**처리**: 예정된 배포 일정에 포함

### 검토필요 (Requires Review)

**조건**:
- 리스크 있음
- 비가역적 변경
- 상위 승인 필요

**처리**: 추가 검토 후 배포 결정

## 타입 분류 기준

### 콘텐츠 (Content)

- 이미지/텍스트/문서 변경
- 정적 콘텐츠 업데이트

### 프론트엔드 (Frontend)

- UI/UX 변경
- 스타일/레이아웃 수정
- 클라이언트 로직 변경

### 백엔드 (Backend)

- 서버 로직 변경
- 데이터 처리
- 외부 API 연동

### 복합 (Both)

- 프론트엔드 + 백엔드 모두 필요

## Notion MCP 사용

### 티켓 생성

```javascript
// MCP 도구: mcp__notion__API-post-page
{
  "parent": {
    "database_id": "<NOTION_DB_ID>"
  },
  "properties": {
    "제목": {
      "title": [{ "text": { "content": "티켓 제목" } }]
    },
    "상태": {
      "select": { "name": "대기" }
    },
    "난이도": {
      "select": { "name": "쉬움" }
    },
    "타입": {
      "select": { "name": "콘텐츠" }
    },
    "배포가능": {
      "select": { "name": "즉시" }
    },
    "우선순위": {
      "select": { "name": "높음" }
    },
    "요청일": {
      "date": { "start": "2025-01-30" }
    }
  },
  "children": [
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [{ "text": { "content": "상세 내용..." } }]
      }
    }
  ]
}
```

### 티켓 업데이트

```javascript
// MCP 도구: mcp__notion__API-patch-page
{
  "page_id": "<PAGE_ID>",
  "properties": {
    "상태": {
      "select": { "name": "완료" }
    },
    "완료일": {
      "date": { "start": "2025-01-30" }
    }
  }
}
```

### 티켓 조회

```javascript
// MCP 도구: mcp__notion__API-query-data-source
{
  "database_id": "<NOTION_DB_ID>",
  "filter": {
    "property": "상태",
    "select": {
      "equals": "대기"
    }
  },
  "sorts": [
    {
      "property": "우선순위",
      "direction": "ascending"
    }
  ]
}
```

## 출력 형식

### 생성 결과

```markdown
## ✅ 티켓 생성 완료

**티켓 ID**: TICKET-20250130-001
**Notion URL**: https://notion.so/...

### 티켓 정보
| 항목 | 값 |
|------|-----|
| 제목 | 메인 배너 이미지 교체 |
| 상태 | 대기 |
| 난이도 | 쉬움 |
| 타입 | 콘텐츠 |
| 배포가능 | 즉시 |
| 우선순위 | 높음 |

### 자동 분류 근거
- 난이도 '쉬움': 단일 이미지 파일 교체, 로직 변경 없음
- 배포 '즉시': 리스크 낮은 콘텐츠 변경
- 타입 '콘텐츠': 이미지 리소스 변경
```

### 목록 조회 결과

```markdown
## 📋 티켓 목록

| ID | 제목 | 상태 | 난이도 | 우선순위 |
|----|------|------|--------|---------|
| TICKET-001 | 메인 배너 교체 | 대기 | 쉬움 | 높음 |
| TICKET-002 | PDF 업데이트 | 진행중 | 쉬움 | 중간 |
| TICKET-003 | 폼 기능 추가 | 대기 | 어려움 | 낮음 |

총 3건 (대기: 2, 진행중: 1)
```

## 관련 참조

- `references/ticket-template.md` - 티켓 템플릿
- `references/category-rules.md` - 분류 상세 규칙
- `references/notion-schema.md` - Notion 스키마 상세

## 환경 설정

### Notion 데이터베이스 ID

`.workflow/config.json` 또는 환경 변수로 설정:

```json
{
  "notion": {
    "database_id": "YOUR_NOTION_DATABASE_ID"
  }
}
```

### MCP 연결 확인

```bash
# Notion MCP 도구 사용 가능 여부 확인
# mcp__notion__API-post-page 등이 사용 가능해야 함
```
