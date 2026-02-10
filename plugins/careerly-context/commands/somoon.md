# 소문(somoon) DB 조회

소문 데이터베이스에서 데이터를 조회하고 분석합니다.

## 사용법
/careerly-context:somoon [명령] [옵션]

## 명령어

### tables - 테이블 목록
mcp__somoon-db__list_tables()

### describe [테이블명] - 테이블 상세
mcp__somoon-db__describe_table(table_name="테이블명")

### query [SQL] - SQL 쿼리
mcp__somoon-db__execute_query(query="SELECT ...")

### analyze [질문] - 자연어 분석
mcp__somoon-db__analyze_data(question="질문")

## 예시
/careerly-context:somoon tables
/careerly-context:somoon describe users
/careerly-context:somoon query SELECT COUNT(*) FROM users
/careerly-context:somoon analyze 최근 가입한 사용자 수

## 필요 MCP
- somoon-db: .mcp.json에 설정 필요
