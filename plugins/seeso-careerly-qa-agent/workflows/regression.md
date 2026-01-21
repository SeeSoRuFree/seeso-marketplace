# Regression Workflow

## 목적
모든 기존 기능이 변경사항으로 인해 영향받지 않았는지 철저히 검증합니다. 주요 릴리즈, 대규모 리팩토링, 프로덕션 배포 전에 수행합니다.

## 사용 시나리오
- 프로덕션 배포 전 최종 검증
- 주간/월간 정기 품질 체크
- 대규모 리팩토링 후
- Critical 버그 수정 후
- 프레임워크 업그레이드 후

## 전제조건

### 서버 상태
- Frontend: http://localhost:3000 안정적 실행
- Backend: http://localhost:8000 안정적 실행
- Database: 테스트 데이터 로드 완료

### 환경 준비
```bash
# 1. 서버 실행 확인
curl -f http://localhost:3000 && curl -f http://localhost:8000/health

# 2. 테스트 환경 초기화
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly2-backend
./venv/bin/python manage.py migrate
./venv/bin/python manage.py loaddata test_fixtures.json

# 3. Playwright 브라우저 설치
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
npx playwright install --with-deps

# 4. 이전 리포트 아카이빙
mkdir -p regression-reports/archive
mv regression-reports/latest/* regression-reports/archive/$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true
```

## 워크플로우 단계

### 1. Pre-Regression Check (5분)

**목표**: 회귀 테스트를 안전하게 실행할 수 있는 환경인지 확인합니다.

#### 1.1 환경 검증
```bash
#!/bin/bash
# pre-regression-check.sh

echo "=== Pre-Regression Check ==="

# 서버 상태
echo "✓ Checking servers..."
FRONT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
BACK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$FRONT_STATUS" != "200" ] || [ "$BACK_STATUS" != "200" ]; then
    echo "❌ Servers not ready (Front: $FRONT_STATUS, Back: $BACK_STATUS)"
    exit 1
fi

# 데이터베이스 연결
echo "✓ Checking database..."
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly2-backend
DB_CHECK=$(./venv/bin/python manage.py check --database default 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ Database connection failed"
    echo "$DB_CHECK"
    exit 1
fi

# 테스트 데이터 존재 확인
echo "✓ Checking test data..."
TEST_USER_COUNT=$(./venv/bin/python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(username__startswith='test_').count())")
if [ "$TEST_USER_COUNT" -lt 5 ]; then
    echo "⚠️  Insufficient test users ($TEST_USER_COUNT). Loading fixtures..."
    ./venv/bin/python manage.py loaddata test_fixtures.json
fi

# 디스크 공간 (스크린샷/비디오 저장용)
echo "✓ Checking disk space..."
DISK_AVAIL=$(df -h . | awk 'NR==2 {print $4}' | sed 's/Gi//')
if [ "$DISK_AVAIL" -lt 10 ]; then
    echo "⚠️  Low disk space: ${DISK_AVAIL}GB available"
fi

echo "✅ Pre-regression check passed"
```

#### 1.2 베이스라인 설정
```bash
# 현재 git 상태 기록
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
GIT_COMMIT=$(git rev-parse HEAD)
GIT_BRANCH=$(git branch --show-current)

echo "Regression Test Baseline" > regression-reports/latest/baseline.txt
echo "Date: $(date)" >> regression-reports/latest/baseline.txt
echo "Branch: $GIT_BRANCH" >> regression-reports/latest/baseline.txt
echo "Commit: $GIT_COMMIT" >> regression-reports/latest/baseline.txt
```

### 2. Test Execution (30-60분)

**목표**: 전체 테스트 슈트를 순차적으로 실행합니다.

#### 2.1 테스트 카테고리

```bash
# 실행 순서 (중요도 순)
TEST_SUITES=(
  "tests/smoke"           # 5분
  "tests/critical"        # 10분
  "tests/authentication"  # 10분
  "tests/features"        # 15분
  "tests/integration"     # 10분
  "tests/ui"             # 10분
)
```

#### 2.2 순차 실행 스크립트
```bash
#!/bin/bash
# run-regression.sh

cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2

echo "=== Regression Test Suite ==="
START_TIME=$(date +%s)

TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_SKIPPED=0

for SUITE in "${TEST_SUITES[@]}"; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Running: $SUITE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    SUITE_START=$(date +%s)

    # 테스트 실행
    npx playwright test "$SUITE" \
        --reporter=html,json \
        --output=test-results/$SUITE \
        --timeout=30000 \
        --retries=2

    EXIT_CODE=$?
    SUITE_END=$(date +%s)
    SUITE_DURATION=$((SUITE_END - SUITE_START))

    # 결과 파싱
    if [ -f "test-results/results.json" ]; then
        PASSED=$(jq '[.suites[].specs[].tests[] | select(.status == "expected")] | length' test-results/results.json)
        FAILED=$(jq '[.suites[].specs[].tests[] | select(.status == "unexpected")] | length' test-results/results.json)
        SKIPPED=$(jq '[.suites[].specs[].tests[] | select(.status == "skipped")] | length' test-results/results.json)

        TOTAL_PASSED=$((TOTAL_PASSED + PASSED))
        TOTAL_FAILED=$((TOTAL_FAILED + FAILED))
        TOTAL_SKIPPED=$((TOTAL_SKIPPED + SKIPPED))

        echo "Results: $PASSED passed, $FAILED failed, $SKIPPED skipped (${SUITE_DURATION}s)"
    fi

    # 실패 시에도 계속 진행 (전체 결과 확인 위해)
    if [ $EXIT_CODE -ne 0 ]; then
        echo "⚠️  Suite failed but continuing..."
    fi
done

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Regression Test Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total: $((TOTAL_PASSED + TOTAL_FAILED)) tests"
echo "Passed: $TOTAL_PASSED"
echo "Failed: $TOTAL_FAILED"
echo "Skipped: $TOTAL_SKIPPED"
echo "Duration: ${TOTAL_DURATION}s ($((TOTAL_DURATION / 60))m $((TOTAL_DURATION % 60))s)"

# 실패율 계산
if [ $((TOTAL_PASSED + TOTAL_FAILED)) -gt 0 ]; then
    FAILURE_RATE=$(awk "BEGIN {printf \"%.2f\", ($TOTAL_FAILED / ($TOTAL_PASSED + $TOTAL_FAILED)) * 100}")
    echo "Failure Rate: ${FAILURE_RATE}%"

    # 성공 기준 체크 (5% 이하 실패율)
    if (( $(echo "$FAILURE_RATE > 5.0" | bc -l) )); then
        echo "❌ REGRESSION FAILED (Failure rate > 5%)"
        exit 1
    else
        echo "✅ REGRESSION PASSED"
        exit 0
    fi
fi
```

#### 2.3 병렬 실행 (선택적, 고성능 머신)
```bash
# 리소스가 충분하면 병렬 실행 가능
npx playwright test \
    --workers=4 \
    --reporter=html,json \
    --retries=2
```

### 3. Results Analysis (10분)

**목표**: 테스트 결과를 심층 분석하고 패턴을 찾습니다.

#### 3.1 결과 집계
```bash
# results-analyzer.sh
#!/bin/bash

echo "=== Analyzing Regression Results ==="

# JSON 결과 파일들 병합
jq -s 'add' test-results/*/results.json > regression-reports/latest/merged-results.json

# 실패 패턴 분석
echo "Failed Tests by Category:"
jq -r '.suites[] | .specs[] | .tests[] | select(.status == "unexpected") | .title' \
    regression-reports/latest/merged-results.json | \
    awk '{print $1}' | sort | uniq -c | sort -rn

# 가장 느린 테스트 Top 10
echo ""
echo "Slowest Tests:"
jq -r '.suites[] | .specs[] | .tests[] | "\(.duration)\t\(.title)"' \
    regression-reports/latest/merged-results.json | \
    sort -rn | head -10

# Flaky 테스트 감지 (재시도 후 성공)
echo ""
echo "Potentially Flaky Tests:"
jq -r '.suites[] | .specs[] | .tests[] | select(.status == "expected" and .results | length > 1) | .title' \
    regression-reports/latest/merged-results.json
```

#### 3.2 스크린샷/비디오 정리
```bash
# 실패한 테스트의 증거만 보관
find test-results -name "*-failed-*.png" -exec cp {} regression-reports/latest/failures/ \;
find test-results -name "video.webm" -path "*/test-failed/*" -exec cp {} regression-reports/latest/failures/ \;

# 성공한 테스트의 아티팩트는 삭제 (디스크 절약)
find test-results -name "*-passed-*" -delete
```

#### 3.3 이전 결과와 비교
```bash
# 이전 회귀 테스트 결과와 비교
if [ -f "regression-reports/archive/latest/merged-results.json" ]; then
    echo "=== Comparing with Previous Run ==="

    PREV_PASSED=$(jq '[.suites[].specs[].tests[] | select(.status == "expected")] | length' \
        regression-reports/archive/latest/merged-results.json)
    CURR_PASSED=$(jq '[.suites[].specs[].tests[] | select(.status == "expected")] | length' \
        regression-reports/latest/merged-results.json)

    DIFF=$((CURR_PASSED - PREV_PASSED))

    if [ $DIFF -lt 0 ]; then
        echo "⚠️  $((DIFF * -1)) tests degraded since last run"
    elif [ $DIFF -gt 0 ]; then
        echo "✅ $DIFF tests improved since last run"
    else
        echo "→ No change in pass rate"
    fi
fi
```

### 4. Report Generation (5분)

**목표**: 포괄적인 회귀 테스트 리포트를 생성합니다.

#### 4.1 상세 리포트 생성
```markdown
# Regression Test Report

**Generated**: [YYYY-MM-DD HH:MM:SS]
**Branch**: [branch-name]
**Commit**: [commit-hash]
**Duration**: [M]m [S]s

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Tests | [N] | - |
| Passed | [N] ([%]%) | ✅/⚠️/❌ |
| Failed | [N] ([%]%) | ✅/⚠️/❌ |
| Skipped | [N] | - |
| Failure Rate | [%]% | ✅/⚠️/❌ |

**Overall Status**: ✅ PASS / ⚠️ WARNING / ❌ FAIL

### Quality Gates

- [ ] Failure rate ≤5% (Required for production)
- [ ] Critical path 100% pass (Required)
- [ ] No new regressions (Compared to baseline)
- [ ] No flaky tests detected (Nice to have)

---

## Test Results by Suite

### Smoke Tests
- **Status**: ✅ PASS
- **Passed**: 10/10 (100%)
- **Duration**: 30s

### Critical Path Tests
- **Status**: ⚠️ WARNING
- **Passed**: 14/15 (93.3%)
- **Duration**: 5m 12s
- **Failures**:
  - `test_post_creation_with_image` (timeout)

### Authentication Tests
- **Status**: ✅ PASS
- **Passed**: 12/12 (100%)
- **Duration**: 8m 45s

### Feature Tests
- **Status**: ✅ PASS
- **Passed**: 45/48 (93.75%)
- **Duration**: 15m 30s
- **Failures**:
  - `test_search_with_special_characters`
  - `test_notification_realtime_update`
  - `test_profile_image_upload_large`

### Integration Tests
- **Status**: ✅ PASS
- **Passed**: 20/20 (100%)
- **Duration**: 10m 15s

### UI Tests
- **Status**: ✅ PASS
- **Passed**: 18/20 (90%)
- **Duration**: 12m 30s
- **Failures**:
  - `test_responsive_layout_mobile`
  - `test_dark_mode_toggle`

---

## Failed Tests Detail

### 1. test_post_creation_with_image
- **Suite**: Critical Path
- **Priority**: P0
- **Error**: `TimeoutError: Waiting for selector 'button[type="submit"]' failed`
- **Duration**: 30s (timeout)
- **Screenshots**: [view](./failures/test_post_creation_with_image-failed.png)
- **Video**: [watch](./failures/test_post_creation_with_image-video.webm)

**Steps to Reproduce**:
1. Navigate to `/posts/new`
2. Upload image (5MB PNG)
3. Fill title and content
4. Click submit button

**Expected**: Post created successfully
**Actual**: Submit button never appeared

**Root Cause**: Image upload takes >20s for large files
**Recommendation**: Increase timeout to 60s or optimize image processing

---

### 2. test_search_with_special_characters
- **Suite**: Features
- **Priority**: P2
- **Error**: `AssertionError: Expected at least 1 result, got 0`

**Details**:
- Input: `검색어!@#$%^&*()`
- Expected: 5 results
- Actual: 0 results

**Root Cause**: Backend search query escaping issue
**Recommendation**: Fix special character handling in search API

---

## Performance Analysis

### Slowest Tests (Top 10)

| Test | Duration | Status |
|------|----------|--------|
| test_full_feed_pagination | 45s | ✅ |
| test_profile_page_with_posts | 38s | ✅ |
| test_post_creation_with_image | 30s | ❌ |
| test_comment_thread_loading | 28s | ✅ |
| test_search_with_filters | 25s | ✅ |
| ... | ... | ... |

**Recommendation**: Optimize tests >30s with better wait strategies

### Flaky Tests Detected

| Test | Retries | Success Rate |
|------|---------|--------------|
| test_notification_realtime_update | 2 | 33% |
| test_websocket_connection | 1 | 50% |

**Recommendation**: Investigate race conditions in WebSocket tests

---

## Code Coverage (Optional)

- **Lines**: 78% (baseline: 75%)
- **Branches**: 65% (baseline: 63%)
- **Functions**: 82% (baseline: 80%)

[View detailed coverage report](./coverage/index.html)

---

## Comparison with Baseline

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Total Tests | 150 | 155 | +5 |
| Pass Rate | 95.3% | 94.2% | -1.1% |
| Avg Duration | 48m | 52m | +4m |

**New Failures** (not in baseline):
- test_post_creation_with_image

**Fixed Issues** (passed now):
- test_login_with_invalid_email

---

## Recommendations

### Immediate Actions (P0)
1. Fix `test_post_creation_with_image` timeout issue
2. Increase timeout for image upload tests

### Short-term (P1)
1. Fix search special character handling
2. Investigate flaky WebSocket tests
3. Optimize slow tests (>30s)

### Long-term (P2)
1. Increase test coverage to 80%
2. Reduce overall regression time to <45m
3. Set up nightly regression runs

---

## Artifacts

- [HTML Report](./playwright-report/index.html)
- [JSON Results](./merged-results.json)
- [Failure Screenshots](./failures/)
- [Test Videos](./failures/)
- [Code Coverage](./coverage/index.html)

---

## Approval

- [ ] QA Engineer: [Name]
- [ ] Tech Lead: [Name]
- [ ] Release Manager: [Name]

**Approved for Production**: ✅ YES / ❌ NO

**Notes**:
[Additional comments]
```

#### 4.2 리포트 생성 스크립트
```bash
# generate-regression-report.sh
#!/bin/bash

REPORT_DIR="regression-reports/latest"
TEMPLATE="regression-report-template.md"
OUTPUT="$REPORT_DIR/regression-report.md"

# 변수 치환
cat "$TEMPLATE" | \
    sed "s/\[YYYY-MM-DD HH:MM:SS\]/$(date '+%Y-%m-%d %H:%M:%S')/g" | \
    sed "s/\[branch-name\]/$(git branch --show-current)/g" | \
    sed "s/\[commit-hash\]/$(git rev-parse --short HEAD)/g" \
    > "$OUTPUT"

echo "Report generated: $OUTPUT"

# HTML 변환 (선택적)
if command -v pandoc &> /dev/null; then
    pandoc "$OUTPUT" -o "$REPORT_DIR/regression-report.html"
    echo "HTML report: $REPORT_DIR/regression-report.html"
fi
```

## 성공/실패 판단 기준

### ✅ PASS (Production Ready)
- Failure rate ≤5%
- Critical path 100% pass
- No new regressions
- No P0 bugs found

### ⚠️ WARNING (Deploy with Caution)
- Failure rate 5-10%
- Critical path 95-99% pass
- New regressions in low-priority features only
- Only P1-P2 bugs found

### ❌ FAIL (Block Deployment)
- Failure rate >10%
- Critical path <95% pass
- New regressions in critical features
- Any P0 bugs found

## 출력 형식

### 콘솔 출력
```
[Regression] Starting Regression Test Suite...
[Regression] ✓ Pre-regression check passed
[Regression] → Running smoke tests...
[Regression] ✓ Smoke: 10/10 passed (30s)
[Regression] → Running critical path tests...
[Regression] ⚠️  Critical: 14/15 passed (5m 12s)
[Regression] → Running authentication tests...
[Regression] ✓ Auth: 12/12 passed (8m 45s)
[Regression] → Running feature tests...
[Regression] ✓ Features: 45/48 passed (15m 30s)
[Regression] → Running integration tests...
[Regression] ✓ Integration: 20/20 passed (10m 15s)
[Regression] → Running UI tests...
[Regression] ✓ UI: 18/20 passed (12m 30s)
[Regression] → Analyzing results...
[Regression] → Generating report...
[Regression] ⚠️  REGRESSION WARNING: 94.2% pass rate (target: 95%)
[Regression]
[Regression] Summary:
[Regression]   Total: 155 tests
[Regression]   Passed: 146 (94.2%)
[Regression]   Failed: 9 (5.8%)
[Regression]   Duration: 52m 30s
[Regression]
[Regression] Report: file:///Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2/regression-reports/latest/regression-report.html
```

## 예상 소요 시간

| Phase | Duration |
|-------|----------|
| Pre-check | 5분 |
| Smoke | 5분 |
| Critical | 10분 |
| Auth | 10분 |
| Features | 15분 |
| Integration | 10분 |
| UI | 10분 |
| Analysis | 5분 |
| Report | 5분 |
| **Total** | **75분** |

## 자동화 스크립트

### 전체 회귀 테스트 실행
```bash
#!/bin/bash
# run-full-regression.sh

set -e

echo "=== Careerly Regression Test Suite ==="
echo "Start time: $(date)"

# 1. Pre-check
./scripts/pre-regression-check.sh

# 2. Run tests
./scripts/run-regression.sh

# 3. Analyze results
./scripts/results-analyzer.sh

# 4. Generate report
./scripts/generate-regression-report.sh

# 5. Archive results
ARCHIVE_DIR="regression-reports/archive/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE_DIR"
cp -r regression-reports/latest/* "$ARCHIVE_DIR/"

echo ""
echo "=== Regression Test Complete ==="
echo "End time: $(date)"
echo "Report: $ARCHIVE_DIR/regression-report.html"
```

## 스케줄링

### Cron Job (매일 밤 2시)
```bash
# crontab -e
0 2 * * * cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2 && ./scripts/run-full-regression.sh >> /var/log/regression-$(date +\%Y\%m\%d).log 2>&1
```

### GitHub Actions (Weekly)
```yaml
# .github/workflows/weekly-regression.yml
name: Weekly Regression

on:
  schedule:
    - cron: '0 2 * * 0' # Every Sunday 2am
  workflow_dispatch: # Manual trigger

jobs:
  regression:
    runs-on: ubuntu-latest
    timeout-minutes: 120

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd careerly-v2 && pnpm install

      - name: Start services
        run: docker-compose up -d

      - name: Wait for services
        run: sleep 30

      - name: Run regression tests
        run: ./scripts/run-full-regression.sh

      - name: Upload report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: regression-report
          path: regression-reports/latest/

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Weekly regression failed! Check the report."
            }
```

## 트러블슈팅

### 테스트가 너무 오래 걸림
```bash
# 병렬 실행으로 속도 향상
npx playwright test --workers=4

# 느린 테스트 식별
jq -r '.suites[] | .specs[] | .tests[] | "\(.duration)\t\(.title)"' \
    test-results/results.json | sort -rn | head -20
```

### 메모리 부족
```bash
# 테스트 스위트를 더 작은 단위로 분할
for SUITE in tests/*/; do
    npx playwright test "$SUITE"
    sleep 10 # 메모리 해제 대기
done
```

### 디스크 공간 부족
```bash
# 오래된 리포트 삭제
find regression-reports/archive -type d -mtime +30 -exec rm -rf {} \;

# 성공한 테스트 아티팩트 즉시 삭제
npx playwright test --reporter=html --output=/tmp/test-results
```

## 관련 문서
- [Full QA Workflow](./full-qa.md)
- [Quick Check Workflow](./quick-check.md)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Strategy Guide](../docs/test-strategy.md)
