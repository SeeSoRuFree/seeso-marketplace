---
name: prototype-analyzer
description: |
  React/Next.js 프로토타입 프론트엔드 코드를 분석하여 프로덕션 전환 전 필요한 모든 기획적 요소를 정리합니다.
  Use this skill when users ask to "analyze prototype", "프로토타입 분석", "프로덕션 전환 준비",
  "서비스 분석", "코드 기획 분석", or when they want to prepare a prototype for production.
version: 1.0.0
---

# Prototype Analyzer

React/Next.js 프로토타입 프론트엔드 코드를 분석하여 프로덕션 전환 전 필요한 모든 기획적 요소를 체계적으로 정리합니다.

## 개요

이 스킬은 프로토타입 코드를 분석하여 다음을 생성합니다:
- Information Architecture (IA) 다이어그램
- 전체 화면 목록 및 컴포넌트 카탈로그
- 누락된 기능, 끊어진 링크, 목업 데이터 목록
- 비즈니스 정책 결정 필요 항목
- 우선순위별 액션 플랜
- 회의용 의사결정 안건

## 사전 요구사항

### SERVICE_BRIEF.md 필수

분석 전에 프로젝트 루트에 `SERVICE_BRIEF.md` 파일이 필요합니다.

파일이 없는 경우:
1. 템플릿 위치 안내: `templates/SERVICE_BRIEF.md`
2. 사용자에게 작성 요청
3. 필수 섹션: 서비스 개요, 타겟 사용자, 플랫폼, 핵심 기능, 비즈니스 모델, 외부 서비스

## 실행 워크플로우

### Phase 1: 프로젝트 검증

1. 프로젝트 경로 유효성 확인
2. `SERVICE_BRIEF.md` 존재 확인
   - 없으면 사용자에게 작성 요청
3. 프로젝트 유형 감지:
   - Next.js App Router (`app/` 디렉토리)
   - Next.js Pages Router (`pages/` 디렉토리)
   - React (CRA, Vite 등)
4. 주요 설정 파일 확인:
   - `package.json`
   - `next.config.js` / `next.config.mjs`
   - `tsconfig.json`

### Phase 2: 병렬 에이전트 실행

다음 4개의 에이전트를 **병렬로** 실행:

| 에이전트 | 역할 | 입력 |
|---------|------|------|
| `ia-analyzer` | 라우트 구조, 네비게이션 맵, Mermaid IA | 라우트 파일 목록 |
| `screen-analyzer` | 페이지/컴포넌트/모달 목록, 복잡도 | 컴포넌트 파일 목록 |
| `gap-analyzer` | 미구현 기능, 목업 데이터, TODO | 전체 소스 파일 |
| `policy-analyzer` | 비즈니스 정책, 의사결정 필요 항목 | 전체 소스 + SERVICE_BRIEF |

각 에이전트에 전달할 공유 컨텍스트:
```
{
  project_path: string,
  router_type: 'app' | 'pages' | 'react',
  service_brief: string (SERVICE_BRIEF.md 내용),
  file_list: string[]
}
```

### Phase 3: 결과 통합

1. 각 에이전트 결과 수집
2. 크로스 레퍼런스:
   - gap-analyzer 이슈 → policy-analyzer 의사결정 연결
   - screen-analyzer 화면 → gap-analyzer 누락 기능 연결
3. 우선순위 조정:
   - Critical: 핵심 기능 미구현 + 의사결정 블로커
   - High: 주요 기능 불완전 + 폼 검증/에러 처리
   - Medium: 품질 이슈
   - Low: 개선 권장

### Phase 4: 보고서 생성

`references/report-template.md` 템플릿을 기반으로 최종 보고서 생성.

출력 파일: `{project_path}/prototype-analysis-report.md`

## 보고서 구조 (화면 중심)

보고서는 사람이 직관적으로 이해하고 액션 플랜을 만들 수 있도록 **화면 중심**으로 구성됩니다.

```markdown
# 프로토타입 분석 보고서

## 한눈에 보기
- 구현된 화면: N개
- 추가 필요 화면: M개
- 완성도: XX%

## 1. 구현된 화면 목록
- 페이지 테이블
- 모달/팝업 테이블

## 2. 추가 필요 화면
- SERVICE_BRIEF.md 기반 누락 화면

## 3. 화면별 상세 분석
- 각 화면별: 구현된 것, 문제점, 누락된 것, 의사결정 필요

## 4. 전체 이슈 요약
- 심각도별, 유형별 현황

## 5. 의사결정 필요 항목
- 긴급 / 정책 확정 필요

## 6. 액션 플랜
- Phase 1: 의사결정
- Phase 2: Critical 이슈 해결
- Phase 3: 화면 완성
- Phase 4: 추가 화면 개발
```

### 섹션별 상세

#### 한눈에 보기

프로젝트 현황을 숫자로 요약:

```markdown
| 구분 | 수량 |
|-----|-----|
| **구현된 화면** | 12개 |
| **추가 필요 화면** | 5개 |
| **총 필요 화면** | 17개 |

### 완성도

구현 완료: ████████░░░░░░░░ 70%

| 상태 | 화면 수 |
|-----|--------|
| ✅ 완료 | 8개 |
| ⚠️ 부분 구현 | 4개 |
| ❌ 미구현 | 5개 |
```

#### 3. 화면별 상세 분석

각 화면에 대해 반복되는 형식:

```markdown
### 3.X. {화면명} ({경로})

**상태**: ✅ 완료 / ⚠️ 부분 구현 / ❌ 미구현

#### 구현된 것
- [x] 항목1
- [x] 항목2

#### 문제점
| 이슈 | 심각도 | 위치 | 설명 |
|-----|-------|-----|------|
| 빈 핸들러 | 🔴 | `line:45` | 결제 버튼 onClick 비어있음 |

#### 누락된 것
- [ ] 항목1
- [ ] 항목2

#### 필요한 의사결정
- 질문1?
- 질문2?
```

#### 5. 의사결정 필요 항목

회의 안건으로 바로 사용 가능한 형태:

```markdown
### 🔴 긴급 (개발 블로커)

#### [D-1] 인증 방식 선택
- **현재 상태**: localStorage 임시 저장
- **선택지**:
  | 옵션 | 장점 | 단점 |
  |-----|------|------|
  | A | ... | ... |
  | B | ... | ... |
- **영향 화면**: 로그인, 회원가입, 마이페이지

### 🟡 정책 확정 필요

#### [P-1] 환불 정책
- **결정 필요 사항**:
  - [ ] 환불 가능 기간
  - [ ] 부분 환불 허용 여부
```

#### 6. 액션 플랜

4단계 순차 실행:

```markdown
### Phase 1: 의사결정 (먼저!)
| # | 안건 | 관련 화면 | 담당 |
|---|-----|---------|------|

### Phase 2: Critical 이슈 해결
| # | 작업 | 화면 | 상세 |
|---|-----|-----|------|

### Phase 3: 화면 완성
| # | 화면 | 남은 작업 | 예상 항목 |
|---|-----|---------|---------|

### Phase 4: 추가 화면 개발
| # | 화면 | 유형 | 의존성 |
|---|-----|-----|-------|
```

## 사용 예시

### 기본 사용
```
/analyze-prototype /path/to/my-next-app
```

### 출력 경로 지정
```
/analyze-prototype /path/to/project --output ./docs/analysis.md
```

### 자연어
```
"my-app 프로젝트를 분석해서 프로덕션 전환 준비 사항을 정리해줘"
```

## 에러 처리

### 프로젝트 경로 오류
```
❌ 프로젝트 경로가 유효하지 않습니다: /invalid/path
→ 올바른 프로젝트 경로를 지정해주세요.
```

### SERVICE_BRIEF.md 없음
```
⚠️ SERVICE_BRIEF.md 파일이 없습니다.

분석을 위해 서비스 브리프 문서가 필요합니다.
템플릿을 복사하여 작성해주세요:

cp {plugin_path}/templates/SERVICE_BRIEF.md /your/project/SERVICE_BRIEF.md

필수 작성 항목:
- 서비스 개요/목적
- 타겟 사용자
- 플랫폼 (웹/앱)
- 핵심 기능 목록
- 비즈니스 모델
- 외부 서비스 (인증, 결제 등)
```

### 지원하지 않는 프레임워크
```
⚠️ 지원하지 않는 프로젝트 구조입니다.

감지된 구조: {detected}
지원 프레임워크: Next.js (App/Pages Router), React

package.json을 확인해주세요.
```

## 참고 자료

- `references/report-template.md`: 보고서 전체 템플릿
- `templates/SERVICE_BRIEF.md`: 서비스 브리프 템플릿
