# Full QA Workflow

## 목적
전체 QA 프로세스를 체계적으로 수행하여 Careerly 애플리케이션의 품질을 종합적으로 검증합니다.

## 전제조건

### 서버 상태
- Frontend (careerly-v2): http://localhost:3000 응답 가능
- Backend (careerly2-backend): http://localhost:8000 응답 가능
- Database: careerly-v2-staging-new 연결 가능

### 환경 체크
```bash
# 프론트엔드 체크
curl -f http://localhost:3000 || echo "Frontend not ready"

# 백엔드 체크
curl -f http://localhost:8000/health || echo "Backend not ready"

# 데이터베이스 연결 체크 (Django shell)
cd careerly2-backend && ./venv/bin/python manage.py check --database default
```

## 워크플로우 단계

### 1. Plan (계획 수립)

**목표**: 테스트 범위와 우선순위를 결정합니다.

#### 1.1 최근 변경사항 분석
```bash
# 최근 커밋 확인
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
git log --oneline -10

cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly2-backend
git log --oneline -10
```

#### 1.2 영향도 분석
- Frontend 변경: UI/UX, 라우팅, API 통신 확인
- Backend 변경: API 엔드포인트, 데이터 모델, 비즈니스 로직 확인
- Database 스키마 변경: 마이그레이션 파일 확인

#### 1.3 테스트 우선순위 결정
1. **Critical Path**: 로그인, 회원가입, 메인 피드
2. **High Priority**: 프로필, 게시물 작성/조회, 댓글
3. **Medium Priority**: 검색, 알림, 설정
4. **Low Priority**: 관리자 기능, 통계

#### 1.4 테스트 계획 문서화
```markdown
## Test Plan - [YYYY-MM-DD HH:MM]

### Changed Components
- [변경된 컴포넌트 목록]

### Test Scope
- [ ] Critical Path Tests (필수)
- [ ] High Priority Tests
- [ ] Medium Priority Tests
- [ ] Low Priority Tests (선택)

### Expected Duration
- Estimated: [예상 시간]분
```

### 2. Execute (실행)

**목표**: 계획된 테스트를 실제로 수행합니다.

#### 2.1 환경 준비
```bash
# Playwright 브라우저 확인
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
npx playwright install chromium

# 테스트 데이터 준비 (필요시)
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly2-backend
./venv/bin/python manage.py loaddata test_fixtures.json
```

#### 2.2 테스트 실행 순서

**Phase 1: Smoke Tests (30초)**
```bash
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
npx playwright test tests/smoke/ --reporter=html
```

**Phase 2: Critical Path Tests (5분)**
```bash
npx playwright test tests/critical/ --reporter=html
```

**Phase 3: Feature Tests (10분)**
```bash
npx playwright test tests/features/ --reporter=html
```

**Phase 4: Integration Tests (5분)**
```bash
npx playwright test tests/integration/ --reporter=html
```

#### 2.3 실행 중 모니터링
- 콘솔 에러 확인
- 네트워크 요청 실패 확인
- 응답 시간 모니터링 (>3초는 경고)
- 스크린샷/비디오 자동 캡처 (실패 시)

#### 2.4 에러 핸들링

**일시적 실패 (Flaky Test) 처리**
```bash
# 실패한 테스트만 재실행 (최대 3회)
npx playwright test --last-failed --retries=3
```

**환경 문제 처리**
- 서버 응답 없음: 서버 재시작 후 재실행
- 데이터베이스 연결 실패: 연결 상태 확인 후 재시도
- 타임아웃: 타임아웃 시간 증가 (30초 → 60초) 후 재실행

**재시도 로직**
```python
# 자동 재시도 설정
max_retries = 3
retry_count = 0

while retry_count < max_retries:
    result = run_test()
    if result.success:
        break

    if is_environment_issue(result.error):
        fix_environment()

    retry_count += 1
    wait(exponential_backoff(retry_count))

if retry_count == max_retries:
    mark_as_failed_and_report()
```

### 3. Verify (검증)

**목표**: 테스트 결과를 분석하고 품질 기준을 충족하는지 확인합니다.

#### 3.1 결과 분석
```bash
# HTML 리포트 확인
open playwright-report/index.html

# JSON 결과 파싱
cat test-results/.last-run.json | jq '.suites[] | {name: .title, passed: .tests | map(select(.status == "passed")) | length, failed: .tests | map(select(.status == "failed")) | length}'
```

#### 3.2 품질 기준

**Pass Criteria**
- ✅ Critical Path: 100% 통과
- ✅ High Priority: 95% 이상 통과
- ✅ Medium Priority: 90% 이상 통과
- ✅ 전체 성공률: 95% 이상

**Warning Criteria**
- ⚠️ Critical Path: 95~99% 통과
- ⚠️ High Priority: 90~94% 통과
- ⚠️ 응답 시간: 평균 >2초

**Fail Criteria**
- ❌ Critical Path: <95% 통과
- ❌ 전체 성공률: <90%
- ❌ 데이터 손실 또는 보안 이슈 발견

#### 3.3 실패 원인 분류

**Bug (제품 결함)**
- 예상 동작과 다름
- 에러 메시지 발생
- 데이터 불일치

**Test Issue (테스트 문제)**
- Flaky test (간헐적 실패)
- 잘못된 assertion
- 테스트 데이터 문제

**Environment Issue (환경 문제)**
- 서버 다운
- 네트워크 불안정
- 데이터베이스 연결 끊김

#### 3.4 스크린샷/비디오 검토
```bash
# 실패한 테스트의 증거 확인
ls test-results/*/test-failed-*.png
ls test-results/*/video.webm
```

### 4. Report (보고)

**목표**: 테스트 결과를 명확하게 정리하여 팀에 공유합니다.

#### 4.1 리포트 구조

```markdown
# QA Report - [YYYY-MM-DD HH:MM]

## Executive Summary
- **Overall Status**: ✅ PASS / ⚠️ WARNING / ❌ FAIL
- **Total Tests**: [N]
- **Passed**: [N] ([%]%)
- **Failed**: [N] ([%]%)
- **Skipped**: [N]
- **Duration**: [M]분 [S]초

## Test Results by Priority

### Critical Path (100% required)
- ✅ Login: PASS
- ✅ Main Feed: PASS
- ❌ Post Creation: FAIL (버튼 클릭 불가)

### High Priority (95% required)
- [상세 결과]

### Medium Priority (90% required)
- [상세 결과]

## Failed Tests Detail

### 1. [Test Name]
- **Priority**: Critical
- **Category**: Bug
- **Error**: [에러 메시지]
- **Steps to Reproduce**:
  1. [단계 1]
  2. [단계 2]
- **Screenshot**: ![screenshot](path/to/screenshot.png)
- **Expected**: [예상 결과]
- **Actual**: [실제 결과]
- **Impact**: [영향도]

## Performance Metrics
- **Average Response Time**: [N]ms
- **Slowest Request**: [API endpoint] ([N]ms)
- **Failed Requests**: [N]

## Recommendations
1. [권장사항 1]
2. [권장사항 2]

## Next Steps
- [ ] [액션 아이템 1]
- [ ] [액션 아이템 2]
```

#### 4.2 리포트 생성 자동화
```bash
# 리포트 생성 스크립트
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
node scripts/generate-qa-report.js

# 리포트 저장
cp playwright-report/index.html qa-reports/qa-report-$(date +%Y%m%d-%H%M%S).html
```

#### 4.3 리포트 공유
- Slack 채널에 요약 공유
- 상세 HTML 리포트 링크 첨부
- Critical 실패 건은 즉시 알림

## 성공/실패 판단 기준

### ✅ 성공 (PASS)
- Critical Path 100% 통과
- 전체 성공률 ≥95%
- 심각한 버그 없음
- 응답 시간 평균 <2초

### ⚠️ 경고 (WARNING)
- Critical Path 95~99% 통과
- 전체 성공률 90~94%
- Minor 버그 발견 (UX 개선 필요)
- 응답 시간 평균 2~3초

### ❌ 실패 (FAIL)
- Critical Path <95% 통과
- 전체 성공률 <90%
- 데이터 손실 또는 보안 이슈
- 서비스 다운

## 출력 형식

### 콘솔 출력
```
[QA Agent] Starting Full QA Workflow...
[QA Agent] ✓ Plan completed (5 test suites selected)
[QA Agent] → Executing Phase 1: Smoke Tests...
[QA Agent] ✓ Phase 1 completed (10/10 passed)
[QA Agent] → Executing Phase 2: Critical Path Tests...
[QA Agent] ✗ Phase 2 failed (12/15 passed)
[QA Agent] → Generating report...
[QA Agent] ✗ Full QA: FAIL (see report for details)

Report: file:///Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2/playwright-report/index.html
```

### 리포트 파일
- HTML: `playwright-report/index.html` (시각적 리포트)
- JSON: `test-results/results.json` (기계 판독용)
- Markdown: `qa-reports/qa-report-[timestamp].md` (텍스트 요약)

## 예상 소요 시간

| Phase | Duration |
|-------|----------|
| Plan | 5분 |
| Execute | 20분 |
| Verify | 5분 |
| Report | 5분 |
| **Total** | **35분** |

## 트러블슈팅

### 자주 발생하는 문제

**서버가 응답하지 않음**
```bash
# 서버 상태 확인
lsof -i :3000
lsof -i :8000

# 서버 재시작
cd careerly-v2 && pnpm dev --port 3000
cd careerly2-backend && ./venv/bin/python manage.py runserver 0.0.0.0:8000
```

**데이터베이스 연결 실패**
```bash
# IP 변경 확인
MY_IP=$(curl -s ifconfig.me)
echo "Current IP: $MY_IP"

# 보안그룹 IP 추가
aws ec2 authorize-security-group-ingress --profile dev_careerly \
  --group-id sg-0f1e71089397d1280 \
  --protocol tcp --port 3306 \
  --cidr ${MY_IP}/32
```

**Playwright 브라우저 실행 실패**
```bash
# 브라우저 재설치
npx playwright install --with-deps chromium
```

## 관련 문서
- [Quick Check Workflow](./quick-check.md)
- [Regression Workflow](./regression.md)
- [Playwright 문서](https://playwright.dev/)
