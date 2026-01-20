# 커리어리 통합 컨텍스트 검색

사용자의 질문에 대해 커리어리 프로젝트의 모든 컨텍스트 소스를 검색합니다.

## 검색 소스

1. **슬랙 채널**
   - #공식-회의록 (C01BZ0TSDNX)
   - #커리어리-운영
   - #커리어리-제품
   - #커리어리-아이디어

2. **로컬 문서**
   - /CLAUDE.md - AWS, 서버 구성, RDS 정보
   - /careerly-v2/ - 프론트엔드
   - /careerly2-backend/ - 백엔드
   - /agent-poc/ - AI 에이전트 POC

3. **데이터베이스**
   - Supabase MCP를 통한 DB 조회

4. **GA4/BigQuery**
   - careerly-ga4 MCP를 통한 데이터 조회

## 검색 실행

사용자 질문: $ARGUMENTS

### Step 1: 질문 분석
질문에서 핵심 키워드를 추출하고 관련 소스를 결정합니다.

### Step 2: 병렬 검색 실행
- 슬랙: `mcp__slack__conversations_search_messages` 사용
- 로컬 파일: `Grep`, `Read` 도구 사용
- DB: `mcp__supabase__execute_sql` 사용

### Step 3: 결과 통합
검색 결과를 다음 형식으로 정리:

```markdown
## [주제] 컨텍스트 검색 결과

### 요약
(핵심 정보 2-3문장)

### 상세 정보

**출처: [소스명]**
- 내용...

### 관련 의사결정
- [날짜] 결정 내용

### 주의사항
⚠️ [LEGACY] 표시된 정보는 현재 사용하지 않음
```

## 레거시 정보 처리

다음은 레거시로 표시:
- `beta-database-all` - Legacy Staging
- `careerly-v2-staging-db` - 삭제됨
- `careerly-legacy/` 디렉토리 내용
