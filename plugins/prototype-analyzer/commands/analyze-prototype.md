---
name: analyze-prototype
description: React/Next.js 프로토타입 분석 및 프로덕션 전환 준비 보고서 생성
---

# /analyze-prototype 명령어

React/Next.js 프로토타입을 분석하여 프로덕션 전환에 필요한 항목을 정리합니다.

## 사용법

```
/analyze-prototype <프로젝트경로> [옵션]
```

## 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| `--output <경로>` | 보고서 출력 경로 지정 | `--output ./docs/report.md` |

## 예시

```bash
# 기본 사용
/analyze-prototype /path/to/my-app

# 출력 경로 지정
/analyze-prototype /path/to/project --output ./docs/analysis.md

# 현재 디렉토리 분석
/analyze-prototype .
```

## 사전 요구사항

프로젝트 루트에 `SERVICE_BRIEF.md` 파일이 필요합니다.

파일이 없으면 분석 시작 전에 작성을 요청합니다.

### SERVICE_BRIEF.md 필수 섹션

- 서비스 개요/목적
- 타겟 사용자
- 플랫폼 (웹/앱)
- 핵심 기능 목록
- 비즈니스 모델
- 외부 서비스 (인증, 결제 등)

## 분석 항목

1. **IA (Information Architecture)** - 라우트 구조, 네비게이션 맵
2. **화면 목록** - 페이지, 컴포넌트, 모달 카탈로그
3. **갭 분석** - 미구현 기능, 끊어진 링크, 목업 데이터
4. **정책 분석** - 비즈니스 정책 결정 필요 항목
5. **액션 플랜** - 우선순위별 작업 목록

## 출력

`prototype-analysis-report.md` 파일이 프로젝트 루트에 생성됩니다.

### 보고서 구조

- 한눈에 보기 (완성도, 화면 수)
- 구현된 화면 목록
- 추가 필요 화면
- 화면별 상세 분석
- 전체 이슈 요약
- 의사결정 필요 항목
- 액션 플랜 (4단계)

## 지원 프레임워크

- Next.js (App Router)
- Next.js (Pages Router)
- React (CRA, Vite)

## 관련 스킬

이 명령어는 `prototype-analyzer` 스킬을 실행합니다.
상세 문서: `skills/prototype-analyzer/SKILL.md`
