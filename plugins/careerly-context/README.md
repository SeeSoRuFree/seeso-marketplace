# Careerly Context Plugin

> 커리어리 프로젝트의 '기억'을 담당하는 컨텍스트 플러그인

## Overview

이 플러그인은 커리어리 프로젝트의 모든 컨텍스트를 통합 관리합니다:
- 슬랙 회의록 및 대화 검색
- 로컬 MD 문서 (CLAUDE.md, README 등)
- GA4/BigQuery 데이터 조회
- 의사결정 히스토리 추적

## Commands

| 명령어 | 설명 |
|--------|------|
| `/careerly-context:search [질문]` | 통합 컨텍스트 검색 |
| `/careerly-context:meeting [키워드]` | 회의록 검색 |
| `/careerly-context:infra` | 인프라 정보 조회 |
| `/careerly-context:decision [질문]` | 의사결정 추적 |
| `/careerly-context:save [내용]` | 컨텍스트 히스토리 저장 |
| `/careerly-context:history [검색어]` | 저장된 히스토리 검색 |

## Data Sources

### Slack (MCP: slack)
- `#공식-회의록` - 회의록 저장소
- `#커리어리-운영` - 운영 논의
- `#커리어리-제품` - 제품 관련

### Local Documents
- `/CLAUDE.md` - AWS, 서버 구성, RDS 정보
- `/careerly-v2/` - 프론트엔드
- `/careerly2-backend/` - 백엔드
- `/agent-poc/` - AI 에이전트 POC

### GA4/BigQuery (MCP: careerly-ga4)
- GA4 리포트 조회
- BigQuery 쿼리

### Database (MCP: supabase)
- 커리어리 DB 스키마
- 데이터 조회

## Installation

```bash
claude --plugin-dir ~/.claude/plugins/careerly-context
```

또는 Claude Code 설정에서 플러그인 경로 추가.

## Required MCPs

이 플러그인은 다음 MCP 서버가 필요합니다:
- `slack` - 슬랙 검색
- `supabase` - DB 조회
- `careerly-ga4` - GA4 데이터 (선택)

## Examples

```bash
# 통합 검색
/careerly-context:search MCP 관련 회의 내용

# 회의록 검색
/careerly-context:meeting AI 에이전시

# 인프라 정보
/careerly-context:infra

# 의사결정 추적
/careerly-context:decision 왜 카카오 로그인을 선택했지?
```

## Version

- 1.0.0 - 초기 버전
