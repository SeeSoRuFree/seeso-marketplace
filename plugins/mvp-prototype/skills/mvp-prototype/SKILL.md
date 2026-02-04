---
name: mvp-prototype
description: |
  회의록/기획 자료 분석부터 MVP 프로토타입 빌드, 배포까지 전체 워크플로우를 지원합니다.
  Use this skill when users ask to "build mvp", "MVP 만들어줘", "프로토타입 제작",
  "회의록 분석", "기획서 작성", or when they want to create an MVP from scratch.
version: 1.1.0
---

# MVP Prototype Builder

회의록/기획 자료 분석부터 MVP 프로토타입 완성까지 전체 워크플로우를 자동화합니다.

## 개요

이 스킬은 5단계 워크플로우를 순차적으로 실행합니다:

1. **Analyze** - 회의록/기획 자료 분석 → 기획 문서 생성
2. **Design** - 디자인 스타일 선택 및 확정
3. **Validate** - Open Questions 해결 (빌드 전 필수)
4. **Build** - MVP 프로토타입 빌드
5. **Deploy** - Vercel 배포 (선택)

## 사용법

```
/mvp-prototype [명령어] [옵션]
```

### 명령어

| 명령어 | 설명 |
|--------|------|
| `analyze <파일경로>` | 회의록/기획 자료 분석하여 기획 문서 생성 |
| `design` | 디자인 스타일 3가지 제안 및 선택 |
| `validate` | Open Questions 해결 및 빌드 준비 검증 |
| `build <버전>` | 선택한 디자인으로 MVP 빌드 |
| `deploy` | Vercel에 배포 |
| `full <파일경로>` | 전체 워크플로우 실행 (analyze → design → validate → build) |
| `status` | 현재 프로젝트 상태 확인 |

### 예시

```bash
# 회의록 분석부터 시작
/mvp-prototype analyze ./meeting-notes.txt

# 디자인 스타일 선택
/mvp-prototype design

# v2 디자인으로 빌드
/mvp-prototype build v2

# 전체 워크플로우 한번에
/mvp-prototype full ./meeting-notes.txt

# 현재 상태 확인
/mvp-prototype status
```

## 워크플로우 상세

### Phase 1: Analyze (분석)

회의록/기획 자료를 분석하여 `.mvp/planning.json` 기획 문서를 생성합니다.

**에이전트 실행 순서:**
1. `product-planner` - 회의록 분석 및 기획 문서 초안 작성
2. `customer-advocate` - 고객 의도 검증 및 누락 사항 체크

**입력:**
- 회의록 파일 (txt, md, docx, pdf)
- 또는 노션/구글독스 URL

**출력:**
- `.mvp/planning.json` - 구조화된 기획 문서
  - 서비스 메타 정보
  - IA (Information Architecture)
  - 사용자 스토리
  - 기능 목록 (우선순위 포함)
  - 외부 연동 목록
  - 정책 (회원, 결제, 데이터)
  - 미결정 사항 (Open Questions)

**검증 기준:**
- customer-advocate 점수 80점 이상
- critical 이슈 없음

### Phase 2: Design (디자인)

3가지 디자인 스타일을 제안하고 사용자가 선택합니다.

**에이전트:**
- `design-director` - 디자인 스타일 제안 및 적용

**제안되는 스타일:**
- V1: 클래식/전문적 스타일
- V2: 모던/트렌디 스타일
- V3: 미니멀/심플 스타일

**각 버전 포함 내용:**
- 컬러 팔레트 (Primary, Secondary, Accent)
- 타이포그래피
- 컴포넌트 스타일 (버튼, 카드, 폼 등)
- 실제 핵심 화면 미리보기 (3개)

**출력:**
- `.mvp/designs/` - 디자인 미리보기 HTML 파일들

### Phase 3: Validate (검증) - 중요!

**빌드 전 필수 단계입니다.** `openQuestions`의 pending 항목을 모두 해결합니다.

**에이전트:**
- `pre-build-validator` - Open Questions 해결 및 빌드 준비 검증

**검증 항목:**
1. `openQuestions`에서 `status: "pending"` 항목 추출
2. 각 항목에 대해 사용자에게 결정 요청 (AskUserQuestion 사용)
3. 결정된 내용을 planning.json에 반영

**예시 프롬프트:**
```
Planning 문서에 미결정 사항이 있습니다.
빌드 전에 결정이 필요합니다:

Q001: 온라인 예약 시스템 연동 여부
- 실제 예약 시스템과 연동할 것인지, 정보 제공만 할 것인지

어떻게 진행할까요?
1. UI 목업으로 구현 (LocalStorage 저장)
2. 실제 API 연동 (백엔드 필요)
3. 이번 빌드에서 제외
```

**출력:**
- planning.json의 openQuestions 상태 업데이트
- 모든 pending이 resolved되면 빌드 진행

---

### Phase 4: Build (빌드)

선택한 디자인으로 전체 MVP를 빌드합니다.

**기술 스택:**
- React 18 + Vite
- Tailwind CSS v4
- React Router DOM
- LocalStorage 기반 데이터 영속화

**빌드 내용:**
- 모든 페이지 구현 (planning.json의 IA 기반)
- 컴포넌트 구현
- 라우팅 설정
- 샘플 데이터 생성
- 화면 간 연결 검증

**출력:**
- `mvp/` - 완전한 React 프로젝트
- `npm run dev`로 즉시 실행 가능

### Phase 5: Deploy (배포) - 선택

Vercel에 배포합니다.

**요구사항:**
- Vercel CLI 설치 (`npm i -g vercel`)
- Vercel 로그인 (`vercel login`)

**출력:**
- 배포된 URL
- 프리뷰 링크

## 프로젝트 구조

```
your-project/
├── .mvp/
│   ├── planning.json       # 기획 문서
│   └── designs/            # 디자인 미리보기
├── mvp/                    # 빌드된 MVP
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── i18n/
│   │   ├── pages/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── meeting-notes.txt       # 원본 회의록
```

## 상태 관리

각 단계의 진행 상태는 `.mvp/status.json`에 저장됩니다:

```json
{
  "phase": "build",
  "analyze": {
    "completed": true,
    "planningFile": ".mvp/planning.json",
    "score": 85
  },
  "design": {
    "completed": true,
    "selectedVersion": "v2",
    "styleName": "Seoul Glow Coral"
  },
  "build": {
    "completed": false,
    "progress": "in_progress"
  },
  "deploy": {
    "completed": false,
    "url": null
  }
}
```

## 에러 처리

### 회의록 없음
```
❌ 분석할 파일이 필요합니다.

사용법: /mvp-prototype analyze <파일경로>
예시: /mvp-prototype analyze ./meeting-notes.txt
```

### 기획서 없이 빌드 시도
```
❌ 기획 문서가 없습니다.

먼저 분석을 실행해주세요:
/mvp-prototype analyze <회의록파일>
```

### 디자인 선택 없이 빌드 시도
```
❌ 디자인이 선택되지 않았습니다.

먼저 디자인을 선택해주세요:
/mvp-prototype design
```

### Open Questions 미해결 상태에서 빌드 시도
```
⚠️ 미결정 사항이 있습니다.

빌드 전에 다음 항목에 대한 결정이 필요합니다:
- Q001: 온라인 예약 시스템 연동 여부 (pending)
- Q002: 회원 로그인/가입 기능 구현 범위 (pending)

다음 명령어로 검증을 실행하세요:
/mvp-prototype validate
```

## 자연어 사용 예시

다음과 같은 자연어 요청도 지원합니다:

- "이 회의록으로 MVP 만들어줘"
- "meeting.txt 분석해서 기획서 작성해줘"
- "디자인 스타일 보여줘"
- "v2 디자인으로 빌드해줘"
- "현재 MVP 상태 알려줘"
- "Vercel에 배포해줘"

## 참고

- `agents/product-planner.md` - 서비스 기획자 에이전트
- `agents/customer-advocate.md` - 고객 의도 검증 에이전트
- `agents/design-director.md` - 디자인 디렉터 에이전트
- `agents/pre-build-validator.md` - 빌드 전 검증 에이전트

---

## 변경 이력

### v1.1.0 (2026-01-18)
- **Validate 단계 추가**: 빌드 전 Open Questions 해결 필수화
- `pre-build-validator` 에이전트 추가
- 워크플로우 4단계 → 5단계로 확장
- Open Questions 미해결 시 빌드 차단 로직 추가

### v1.0.0
- 초기 버전
