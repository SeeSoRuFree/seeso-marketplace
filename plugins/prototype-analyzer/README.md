# Prototype Analyzer Plugin

React/Next.js 프로토타입 프론트엔드 코드를 분석하여 프로덕션 전환 전 필요한 모든 기획적 요소를 체계적으로 정리하는 플러그인입니다.

## 설치

```bash
/plugin install prototype-analyzer@seeso
```

## 사용법

```bash
# 프로젝트 분석
/prototype-analyzer:analyze-prototype /path/to/my-app

# 출력 경로 지정
/prototype-analyzer:analyze-prototype /path/to/project --output ./docs/analysis.md
```

## 사전 요구사항

프로젝트 루트에 `SERVICE_BRIEF.md` 파일이 필요합니다.

### SERVICE_BRIEF.md 필수 섹션

- 서비스 개요/목적
- 타겟 사용자
- 플랫폼 (웹/앱)
- 핵심 기능 목록
- 비즈니스 모델
- 외부 서비스 (인증, 결제 등)

## 분석 항목

| 항목 | 설명 | 에이전트 |
|------|------|---------|
| IA | 라우트 구조, 네비게이션 맵, Mermaid 다이어그램 | `ia-analyzer` |
| 화면 목록 | 페이지, 컴포넌트, 모달 카탈로그 | `screen-analyzer` |
| 갭 분석 | 미구현 기능, 끊어진 링크, 목업 데이터, TODO | `gap-analyzer` |
| 정책 분석 | 비즈니스 정책, 의사결정 필요 항목 | `policy-analyzer` |

## 출력 보고서

`prototype-analysis-report.md` 파일이 생성됩니다.

### 보고서 구조

1. **한눈에 보기** - 완성도, 화면 수 요약
2. **구현된 화면 목록** - 페이지, 모달/팝업
3. **추가 필요 화면** - SERVICE_BRIEF 기반 누락 화면
4. **화면별 상세 분석** - 각 화면의 구현/문제점/누락/의사결정
5. **전체 이슈 요약** - 심각도별, 유형별 현황
6. **의사결정 필요 항목** - 긴급, 정책 확정 필요
7. **액션 플랜** - 4단계 순차 실행 계획

## 지원 프레임워크

- Next.js (App Router)
- Next.js (Pages Router)
- React (CRA, Vite)

## 버전

- **v1.0.0** - 초기 버전

## 라이선스

MIT
