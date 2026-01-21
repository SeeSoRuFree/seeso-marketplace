# Seeso Careerly QA Agent

Careerly 프로젝트를 위한 목적 지향 QA 자동화 플러그인입니다.

## 설치

### 1. Skills 디렉토리에 복사

```bash
# 이미 설치된 경우 스킵
cp -r seeso-careerly-qa-agent ~/.claude/skills/
```

### 2. Git Clone으로 설치

```bash
cd ~/.claude/skills
git clone https://github.com/seeso/seeso-careerly-qa-agent.git
```

### 3. 수동 설치

`~/.claude/skills/seeso-careerly-qa-agent/` 디렉토리에 다음 파일들을 배치:
- `SKILL.md` (필수)
- `manifest.json`
- `workflows/` 디렉토리
- `agents/` 디렉토리
- `tools/` 디렉토리

## 사용법

### 기본 사용

Claude Code에서 다음과 같이 호출합니다:

```
/seeso-careerly-qa-agent
```

또는 인자와 함께:

```
/seeso-careerly-qa-agent check      # 빠른 스모크 테스트
/seeso-careerly-qa-agent plan       # 계획만 수립
/seeso-careerly-qa-agent full       # 전체 QA 워크플로우
/seeso-careerly-qa-agent regression # 전체 회귀 테스트
```

### 명령어 상세

| 명령어 | 설명 | 소요시간 |
|--------|------|----------|
| `check` | 핵심 플로우만 빠르게 검증 (스모크 테스트) | ~30초 |
| `plan` | 변경사항 분석 및 테스트 전략 수립만 | ~1분 |
| `full` | 전체 4단계 QA 워크플로우 | ~35분 |
| `regression` | 모든 테스트 실행 | ~75분 |

### 자동 활성화

다음 키워드 사용 시 자동으로 활성화됩니다:
- "qa", "테스트", "검증"
- "배포전체크", "quality"
- "품질 확인", "QA 돌려줘"

## 워크플로우

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PLAN      │ -> │   EXECUTE   │ -> │   VERIFY    │ -> │   REPORT    │
│ 변경분석    │    │ 테스트실행  │    │ 결과검증    │    │ 리포트생성  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Phase 1: PLAN
- git diff로 변경사항 분석
- 영향 범위 파악
- 테스트 전략 수립

### Phase 2: EXECUTE
- Unit Tests (vitest, pytest)
- E2E Tests (Playwright)
- API Tests (curl)

### Phase 3: VERIFY
- 실패 원인 분석
- 자동 재시도 (최대 3회)
- 최종 판정

### Phase 4: REPORT
- 마크다운 리포트 생성
- 배포 가능 여부 판단

## 프로젝트 구성

이 플러그인은 다음 프로젝트 구조를 전제로 합니다:

```
careerly-perflexity/
├── careerly-v2/          # Frontend (Next.js, port 3000)
│   ├── e2e/              # Playwright E2E 테스트
│   └── ...
└── careerly2-backend/    # Backend (Django, port 8000)
    └── api/tests/        # pytest 테스트
```

### 필수 조건

1. **Frontend 서버 실행**
   ```bash
   cd careerly-v2 && pnpm dev
   ```

2. **Backend 서버 실행** (선택)
   ```bash
   cd careerly2-backend && ./venv/bin/python manage.py runserver
   ```

3. **Playwright 설치**
   ```bash
   cd careerly-v2 && npx playwright install
   ```

## 출력 예시

```markdown
## QA Report - 2026-01-21 17:02

### Summary
| 항목 | 결과 |
|------|------|
| 판정 | ✅ PASS |
| Frontend Server | ✅ 200 OK |
| Backend Server | ✅ 200 OK |
| E2E Tests | ✅ 9/9 passed |

### Issues Found
없음

### Recommendation
배포 진행 가능
```

## 판정 기준

| 판정 | 조건 |
|------|------|
| ✅ PASS | 모든 필수 테스트 통과, 500 에러 없음 |
| ⚠️ WARN | 일부 비핵심 테스트 실패, 수동 확인 권장 |
| ❌ FAIL | 핵심 테스트 실패, 크리티컬 플로우 장애 |

## 파일 구조

```
seeso-careerly-qa-agent/
├── SKILL.md              # 메인 플러그인 정의
├── manifest.json         # 메타데이터
├── README.md             # 이 문서
├── workflows/
│   ├── full-qa.md        # 전체 QA 워크플로우
│   ├── quick-check.md    # 빠른 체크
│   └── regression.md     # 회귀 테스트
├── agents/
│   ├── planner.md        # 계획 에이전트
│   ├── executor.md       # 실행 에이전트
│   └── verifier.md       # 검증 에이전트
└── tools/
    ├── e2e-runner.ts     # Playwright 래퍼
    ├── diff-analyzer.ts  # Git diff 분석
    └── README.md         # 도구 가이드
```

## 커스터마이징

### 테스트 경로 변경

`SKILL.md`에서 프로젝트 설정 수정:

```markdown
### Frontend (careerly-v2)
- **Port**: 3000
- **E2E Test**: `pnpm test:e2e`

### Backend (careerly2-backend)
- **Port**: 8000
- **Unit Test**: `./venv/bin/pytest api/tests/ -q`
```

### 새로운 테스트 추가

`e2e/` 디렉토리에 새로운 `.spec.ts` 파일 추가 시 자동으로 포함됩니다.

## 문제 해결

### "Unknown skill" 에러
- `~/.claude/skills/seeso-careerly-qa-agent/SKILL.md` 파일 존재 확인
- Claude Code 재시작

### 테스트 실패
- 서버가 실행 중인지 확인 (`localhost:3000`, `localhost:8000`)
- Playwright 브라우저 설치 확인: `npx playwright install`

### 타임아웃
- 네트워크 상태 확인
- `--timeout` 옵션 조정

## 라이선스

MIT License - Seeso Team
