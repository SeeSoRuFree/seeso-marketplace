# Quick Check Workflow

## 목적
30초 이내에 Careerly 애플리케이션의 핵심 기능이 정상 동작하는지 빠르게 확인합니다.

## 사용 시나리오
- 개발 중 빠른 검증
- PR 머지 전 스모크 테스트
- 배포 후 즉시 헬스 체크
- 디버깅 중간 확인

## 전제조건

### 서버 상태
- Frontend: http://localhost:3000 응답 필요
- Backend: http://localhost:8000 응답 필요

### 빠른 서버 체크
```bash
# 한 줄로 확인
curl -f http://localhost:3000 && curl -f http://localhost:8000/health && echo "✅ Servers ready"
```

## 워크플로우 단계

### 1. Health Check (5초)

**목표**: 서버가 살아있는지 확인합니다.

```bash
# Frontend health
STATUS_FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

# Backend health
STATUS_BACK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$STATUS_FRONT" = "200" ] && [ "$STATUS_BACK" = "200" ]; then
    echo "✅ Servers are healthy"
else
    echo "❌ Server check failed (Front: $STATUS_FRONT, Back: $STATUS_BACK)"
    exit 1
fi
```

### 2. Smoke Tests (25초)

**목표**: 핵심 플로우 3가지만 빠르게 검증합니다.

#### Test 1: 메인 페이지 로드 (8초)
```javascript
// tests/smoke/main-page.spec.ts
test('main page loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Careerly/);
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
});
```

**성공 기준**:
- 페이지 로드 완료 (200 OK)
- Title에 "Careerly" 포함
- Header, Main 요소 렌더링

#### Test 2: API 헬스 체크 (7초)
```javascript
// tests/smoke/api-health.spec.ts
test('API health check', async ({ request }) => {
  const response = await request.get('http://localhost:8000/health');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.status).toBe('healthy');
  expect(data.database).toBe('connected');
});
```

**성공 기준**:
- HTTP 200 응답
- status: "healthy"
- database: "connected"

#### Test 3: 로그인 페이지 접근 (10초)
```javascript
// tests/smoke/login-page.spec.ts
test('login page accessible', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});
```

**성공 기준**:
- 로그인 페이지 로드
- Email, Password 입력 필드 존재
- Submit 버튼 존재

### 3. 실행 명령어

```bash
# Quick check 실행 (단일 명령어)
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
npx playwright test tests/smoke/ --timeout=10000 --reporter=line
```

**Playwright 설정 최적화**
```javascript
// playwright.config.ts (quick-check용)
export default {
  testDir: './tests/smoke',
  timeout: 10000, // 테스트당 10초
  workers: 3, // 병렬 실행
  retries: 0, // 재시도 없음
  reporter: 'line', // 간단한 출력
  use: {
    headless: true,
    screenshot: 'off', // 스크린샷 비활성화
    video: 'off', // 비디오 비활성화
    trace: 'off', // 트레이스 비활성화
  },
};
```

## 성공/실패 판단 기준

### ✅ 성공 (PASS)
- 3개 테스트 모두 통과
- 총 실행 시간 ≤30초
- 모든 서버 응답 정상

**출력 예시**:
```
Running 3 tests using 3 workers

  ✓ [chromium] › smoke/main-page.spec.ts:3:1 › main page loads (2s)
  ✓ [chromium] › smoke/api-health.spec.ts:3:1 › API health check (1s)
  ✓ [chromium] › smoke/login-page.spec.ts:3:1 › login page accessible (3s)

  3 passed (6s)
```

### ❌ 실패 (FAIL)
- 1개 이상 테스트 실패
- 타임아웃 (>30초)
- 서버 응답 없음

**출력 예시**:
```
Running 3 tests using 3 workers

  ✓ [chromium] › smoke/main-page.spec.ts:3:1 › main page loads (2s)
  ✗ [chromium] › smoke/api-health.spec.ts:3:1 › API health check (1s)
    Error: expect(received).toBeTruthy()
    Expected: truthy
    Received: false

  2 passed, 1 failed (3s)
```

## 에러 핸들링

### 재시도 정책
Quick Check는 **재시도 없음** (속도 우선)

### 실패 시 액션
1. 콘솔에 에러 출력
2. 실패한 테스트 이름 표시
3. Full QA 권장 메시지 출력

```bash
if [ $? -ne 0 ]; then
    echo "❌ Quick check failed!"
    echo "💡 Run full QA for detailed analysis: claude /qa full"
    exit 1
fi
```

## 출력 형식

### 콘솔 출력 (성공)
```
[QA Agent] Quick Check Starting...
[QA Agent] ✓ Health Check (2s)
[QA Agent] ✓ Smoke Tests (24s)
[QA Agent] ✅ Quick Check: PASS (26s total)
```

### 콘솔 출력 (실패)
```
[QA Agent] Quick Check Starting...
[QA Agent] ✓ Health Check (2s)
[QA Agent] ✗ Smoke Tests (10s)
[QA Agent]   ❌ API health check failed
[QA Agent]     Error: Database connection timeout
[QA Agent] ❌ Quick Check: FAIL (12s total)
[QA Agent] 💡 Recommendation: Check backend server and database connection
```

### JSON 출력 (선택적)
```json
{
  "status": "pass",
  "duration": 26,
  "tests": [
    {
      "name": "main page loads",
      "status": "passed",
      "duration": 2
    },
    {
      "name": "API health check",
      "status": "passed",
      "duration": 1
    },
    {
      "name": "login page accessible",
      "status": "passed",
      "duration": 3
    }
  ],
  "timestamp": "2026-01-21T10:30:00Z"
}
```

## 성능 최적화 팁

### 1. 병렬 실행
```javascript
// 3개 테스트를 동시에 실행
workers: 3
```

### 2. 불필요한 기능 비활성화
```javascript
screenshot: 'off',
video: 'off',
trace: 'off',
```

### 3. 타임아웃 단축
```javascript
timeout: 10000, // 10초로 제한
```

### 4. 최소 assertion
```javascript
// ❌ 나쁜 예 (느림)
await expect(page.locator('.post')).toHaveCount(10);
await expect(page.locator('.user-profile')).toBeVisible();
await expect(page.locator('.sidebar')).toBeVisible();

// ✅ 좋은 예 (빠름)
await expect(page.locator('main')).toBeVisible();
```

## 사용 예시

### CLI에서 실행
```bash
# 기본 실행
cd /Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2
npx playwright test tests/smoke/ --reporter=line

# 특정 브라우저만
npx playwright test tests/smoke/ --project=chromium

# 헤드리스 모드 해제 (디버깅용)
npx playwright test tests/smoke/ --headed
```

### Git Hook에 통합
```bash
# .git/hooks/pre-push
#!/bin/bash
echo "Running quick check before push..."
cd careerly-v2
npx playwright test tests/smoke/ --reporter=line

if [ $? -ne 0 ]; then
    echo "❌ Quick check failed. Push aborted."
    exit 1
fi
```

### CI/CD 파이프라인
```yaml
# .github/workflows/quick-check.yml
name: Quick Check

on: [pull_request]

jobs:
  quick-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: cd careerly-v2 && pnpm install

      - name: Start servers
        run: |
          cd careerly-v2 && pnpm dev &
          cd careerly2-backend && ./venv/bin/python manage.py runserver &
          sleep 10

      - name: Run quick check
        run: |
          cd careerly-v2
          npx playwright test tests/smoke/ --reporter=line
        timeout-minutes: 1
```

## 제한사항

### 확인하지 않는 것들
- ❌ 데이터베이스 CRUD 작업
- ❌ 인증/인가 로직
- ❌ 복잡한 사용자 플로우
- ❌ Edge case 처리
- ❌ 성능 메트릭

### 확인하는 것들
- ✅ 서버 응답 여부
- ✅ 페이지 렌더링
- ✅ 핵심 UI 요소 존재
- ✅ 기본 API 통신

## 언제 Full QA로 전환해야 하나?

### Quick Check로 충분한 경우
- CSS 스타일 변경
- 텍스트 수정
- 간단한 UI 컴포넌트 추가

### Full QA가 필요한 경우
- API 엔드포인트 변경
- 데이터베이스 스키마 변경
- 인증/인가 로직 수정
- 새로운 기능 추가
- 버그 수정

## 트러블슈팅

### 타임아웃 발생
```bash
# 서버 응답 속도 확인
time curl http://localhost:3000
time curl http://localhost:8000/health

# 느리면 서버 재시작
pkill -f "next|django" && pnpm dev & python manage.py runserver &
```

### 간헐적 실패 (Flaky)
```bash
# 3회 연속 실행하여 확인
for i in {1..3}; do
  echo "Run $i:"
  npx playwright test tests/smoke/ --reporter=line
done
```

### 브라우저 실행 실패
```bash
# 브라우저 캐시 삭제
rm -rf ~/.cache/ms-playwright
npx playwright install chromium
```

## 관련 문서
- [Full QA Workflow](./full-qa.md)
- [Regression Workflow](./regression.md)
- [Playwright Quick Start](https://playwright.dev/docs/intro)
