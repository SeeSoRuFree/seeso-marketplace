# QA Agent Tools

Careerly QA 자동화를 위한 TypeScript 도구 모음

## 도구 목록

### 1. E2E Runner (`e2e-runner.ts`)

Playwright 테스트 실행 및 결과 분석 도구

#### 주요 기능
- Playwright 테스트 실행 래퍼
- 테스트 결과 구조화 및 파싱
- 스크린샷/비디오 경로 수집
- 실패 테스트 재실행
- HTML 리포트 생성

#### 사용 예제

```typescript
import { runE2ETests, formatTestResult, retryFailedTest } from './e2e-runner';

// 1. Smoke 테스트 실행
const result = await runE2ETests({
  pattern: 'smoke',
  timeout: 60000
});

console.log(formatTestResult(result));

// 2. 모든 테스트를 headed 모드로 실행
const allTests = await runE2ETests({
  mode: 'headed',
  workers: 2
});

// 3. 특정 테스트 파일만 실행
const searchTests = await runE2ETests({
  pattern: 'search.spec.ts',
  timeout: 30000,
  retries: 1
});

// 4. 실패한 테스트 재실행
if (!result.success) {
  const failedTest = result.tests.find(t => t.status === 'failed');
  if (failedTest) {
    const retryResult = await retryFailedTest(
      failedTest.file,
      failedTest.name,
      { timeout: 60000 }
    );
  }
}

// 5. 결과 분석
console.log(`Total: ${result.stats.total}`);
console.log(`Passed: ${result.stats.passed}`);
console.log(`Failed: ${result.stats.failed}`);

if (result.screenshots.length > 0) {
  console.log('Screenshots:', result.screenshots);
}
```

#### 타입 정의

```typescript
interface E2ETestOptions {
  pattern?: string;
  timeout?: number;
  mode?: 'headless' | 'headed' | 'debug' | 'ui';
  projectRoot?: string;
  retries?: number;
  project?: string;
  workers?: number;
  baseURL?: string;
}

interface E2ETestResult {
  success: boolean;
  startTime: string;
  endTime: string;
  duration: number;
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
  };
  tests: TestResult[];
  screenshots: string[];
  videos: string[];
  reportPath?: string;
  rawOutput: string;
  errorOutput?: string;
}
```

### 2. Diff Analyzer (`diff-analyzer.ts`)

Git diff 분석 및 영향 범위 추론 도구

#### 주요 기능
- Git diff 파싱 및 구조화
- 파일 유형별 자동 분류
- 영향받는 모듈/컴포넌트 추론
- 실행 필요 테스트 추천
- 배포 영향 분석

#### 사용 예제

```typescript
import {
  analyzeDiff,
  formatDiffAnalysis,
  filterByCategories,
  filterByImpact
} from './diff-analyzer';

// 1. main 브랜치와 HEAD 비교
const diff = await analyzeDiff({
  base: 'main',
  head: 'HEAD'
});

console.log(formatDiffAnalysis(diff));

// 2. 특정 커밋 범위 분석
const rangeDiff = await analyzeDiff({
  base: 'abc123',
  head: 'def456',
  includeDetails: true
});

// 3. TypeScript 파일만 분석
const tsDiff = await analyzeDiff({
  base: 'main',
  filePattern: '*.ts'
});

// 4. 결과 필터링
const frontendFiles = filterByCategories(diff, ['frontend', 'component']);
const highImpactModules = filterByImpact(diff, ['high']);

// 5. 추천 테스트 실행
console.log('Recommended tests:', diff.testImpact.recommendedTests);

// 6. 배포 영향 분석
if (diff.deploymentImpact.databaseChanged) {
  console.log('Warning: Database changes detected!');
}

if (diff.deploymentImpact.apiChanged) {
  console.log('Warning: API interface changed!');
}

// 7. 영향받는 모듈 분석
for (const module of diff.affectedModules) {
  console.log(`${module.name} (${module.impact}): ${module.files.length} files`);
}
```

#### 타입 정의

```typescript
interface DiffAnalyzerOptions {
  base?: string;
  head?: string;
  projectRoot?: string;
  includeDetails?: boolean;
  filePattern?: string;
}

interface DiffAnalysisResult {
  comparison: {
    base: string;
    head: string;
    baseSha: string;
    headSha: string;
  };
  stats: {
    totalFiles: number;
    additions: number;
    deletions: number;
    byChangeType: Record<ChangeType, number>;
    byCategory: Record<FileCategory, number>;
  };
  files: FileChange[];
  filesByCategory: Record<FileCategory, FileChange[]>;
  affectedModules: AffectedModule[];
  testImpact: {
    testFilesChanged: boolean;
    recommendedTests: string[];
    affectedTestFiles: string[];
  };
  deploymentImpact: {
    frontendChanged: boolean;
    backendChanged: boolean;
    databaseChanged: boolean;
    configChanged: boolean;
    apiChanged: boolean;
  };
  rawDiff: string;
}
```

## 통합 워크플로우 예제

```typescript
import { analyzeDiff } from './diff-analyzer';
import { runE2ETests, formatTestResult } from './e2e-runner';

/**
 * PR 검증 워크플로우
 */
async function validatePR(baseBranch: string = 'main') {
  console.log('='.repeat(60));
  console.log('Starting PR Validation');
  console.log('='.repeat(60));

  // 1. Diff 분석
  console.log('\n[1/3] Analyzing changes...');
  const diff = await analyzeDiff({ base: baseBranch, head: 'HEAD' });

  console.log(`Found ${diff.stats.totalFiles} changed files`);
  console.log(`Frontend: ${diff.deploymentImpact.frontendChanged ? 'Yes' : 'No'}`);
  console.log(`Backend: ${diff.deploymentImpact.backendChanged ? 'Yes' : 'No'}`);

  // 2. 영향도 높은 변경 경고
  const highImpactModules = diff.affectedModules.filter(m => m.impact === 'high');
  if (highImpactModules.length > 0) {
    console.log('\nWarning: High impact changes detected:');
    highImpactModules.forEach(m => {
      console.log(`  - ${m.name} (${m.type})`);
    });
  }

  // 3. 추천 테스트 실행
  console.log('\n[2/3] Running recommended tests...');
  const recommendedTests = diff.testImpact.recommendedTests;

  if (recommendedTests.length === 0) {
    console.log('No specific tests recommended, running smoke tests...');
    recommendedTests.push('smoke');
  }

  const testResults = [];
  for (const testPattern of recommendedTests) {
    const result = await runE2ETests({
      pattern: testPattern,
      timeout: 60000,
      retries: 1
    });
    testResults.push(result);
  }

  // 4. 결과 요약
  console.log('\n[3/3] Summary');
  console.log('-'.repeat(60));

  let allTestsPassed = true;
  for (const result of testResults) {
    console.log(formatTestResult(result));
    if (!result.success) {
      allTestsPassed = false;
    }
  }

  // 5. 최종 판단
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('✓ All checks passed! Ready to merge.');
  } else {
    console.log('✗ Some checks failed. Please review.');
  }
  console.log('='.repeat(60));

  return {
    diff,
    testResults,
    passed: allTestsPassed
  };
}

// 실행
validatePR('main').then(result => {
  process.exit(result.passed ? 0 : 1);
});
```

## 파일 분류 카테고리

Diff Analyzer는 다음 카테고리로 파일을 자동 분류합니다.

| Category | 설명 | 예시 |
|----------|------|------|
| `frontend` | Frontend 일반 파일 | `careerly-v2/app/**` |
| `backend` | Backend 파일 | `careerly2-backend/**` |
| `test` | 테스트 파일 | `*.test.ts`, `e2e/*.spec.ts` |
| `config` | 설정 파일 | `*.config.ts`, `package.json` |
| `documentation` | 문서 파일 | `*.md`, `*.txt` |
| `database` | DB 스키마/마이그레이션 | `**/migrations/**`, `schema.prisma` |
| `api` | API 서비스 | `**/api/**`, `**/services/**` |
| `component` | React 컴포넌트 | `**/components/**` |
| `style` | 스타일 파일 | `*.css`, `*.scss` |
| `hook` | React 훅 | `**/hooks/**`, `use-*.ts` |
| `utility` | 유틸리티 함수 | `**/lib/**`, `**/utils/**` |
| `type` | 타입 정의 | `**/types/**`, `*.d.ts` |

## 요구사항

- Node.js 18+
- TypeScript 5+
- Playwright (E2E Runner용)
- Git (Diff Analyzer용)

## 설치

```bash
# TypeScript 컴파일러 설치 (필요 시)
npm install -g typescript

# 도구가 위치한 디렉토리에서
tsc e2e-runner.ts
tsc diff-analyzer.ts
```

## 프로젝트 구조

```
~/.claude/plugins/seeso-careerly-qa-agent/
├── tools/
│   ├── e2e-runner.ts      # Playwright 테스트 실행 도구
│   ├── diff-analyzer.ts   # Git diff 분석 도구
│   └── README.md          # 이 파일
├── agents/
│   └── qa-agent.ts        # QA 에이전트 (추후 구현)
└── workflows/
    └── pr-validation.ts   # PR 검증 워크플로우 (추후 구현)
```

## 라이센스

MIT
