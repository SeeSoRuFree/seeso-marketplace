/**
 * E2E Test Runner Tool
 *
 * Playwright 테스트 실행을 위한 래퍼 도구.
 * 특정 테스트 파일/패턴을 실행하고 결과를 구조화하여 반환합니다.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * E2E 테스트 실행 옵션
 */
export interface E2ETestOptions {
  /**
   * 테스트 파일 패턴 (예: 'smoke', 'search', 'smoke.spec.ts')
   * 생략 시 모든 테스트 실행
   */
  pattern?: string;

  /**
   * 실행 타임아웃 (밀리초)
   * @default 60000 (60초)
   */
  timeout?: number;

  /**
   * 실행 모드
   * - 'headless': 헤드리스 모드 (기본값)
   * - 'headed': 브라우저 UI 표시
   * - 'debug': 디버그 모드
   * - 'ui': Playwright UI 모드
   */
  mode?: 'headless' | 'headed' | 'debug' | 'ui';

  /**
   * 프로젝트 루트 경로
   * @default '/Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2'
   */
  projectRoot?: string;

  /**
   * 실패 시 재시도 횟수
   * @default 0
   */
  retries?: number;

  /**
   * 특정 브라우저만 실행 (예: 'chromium', 'firefox', 'webkit')
   */
  project?: string;

  /**
   * 병렬 실행 worker 수
   */
  workers?: number;

  /**
   * Base URL 오버라이드
   * @default 'http://localhost:3000'
   */
  baseURL?: string;
}

/**
 * 개별 테스트 결과
 */
export interface TestResult {
  /**
   * 테스트 파일명
   */
  file: string;

  /**
   * 테스트 이름
   */
  name: string;

  /**
   * 테스트 상태
   */
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';

  /**
   * 실행 시간 (밀리초)
   */
  duration: number;

  /**
   * 에러 메시지 (실패 시)
   */
  error?: string;

  /**
   * 스크린샷 경로 (실패 시)
   */
  screenshots?: string[];

  /**
   * 비디오 경로 (실패 시)
   */
  video?: string;
}

/**
 * E2E 테스트 실행 결과
 */
export interface E2ETestResult {
  /**
   * 전체 실행 성공 여부
   */
  success: boolean;

  /**
   * 실행 시작 시각
   */
  startTime: string;

  /**
   * 실행 종료 시각
   */
  endTime: string;

  /**
   * 총 실행 시간 (밀리초)
   */
  duration: number;

  /**
   * 통계
   */
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
  };

  /**
   * 개별 테스트 결과
   */
  tests: TestResult[];

  /**
   * 실패한 테스트의 스크린샷 경로 목록
   */
  screenshots: string[];

  /**
   * 실패한 테스트의 비디오 경로 목록
   */
  videos: string[];

  /**
   * HTML 리포트 경로
   */
  reportPath?: string;

  /**
   * 원본 출력
   */
  rawOutput: string;

  /**
   * 에러 출력
   */
  errorOutput?: string;
}

/**
 * Playwright 테스트를 실행하고 결과를 파싱합니다.
 *
 * @param options - 테스트 실행 옵션
 * @returns 구조화된 테스트 결과
 *
 * @example
 * ```typescript
 * // Smoke 테스트만 실행
 * const result = await runE2ETests({ pattern: 'smoke' });
 *
 * // 모든 테스트를 headed 모드로 실행
 * const result = await runE2ETests({ mode: 'headed' });
 *
 * // 특정 테스트 파일을 타임아웃 30초로 실행
 * const result = await runE2ETests({
 *   pattern: 'search.spec.ts',
 *   timeout: 30000
 * });
 * ```
 */
export async function runE2ETests(
  options: E2ETestOptions = {}
): Promise<E2ETestResult> {
  const {
    pattern,
    timeout = 60000,
    mode = 'headless',
    projectRoot = '/Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2',
    retries = 0,
    project,
    workers,
    baseURL = 'http://localhost:3000',
  } = options;

  const startTime = new Date();

  // Playwright 명령어 구성
  const commands: string[] = ['pnpm', 'playwright', 'test'];

  // 패턴 지정
  if (pattern) {
    commands.push(pattern);
  }

  // 모드별 옵션
  switch (mode) {
    case 'headed':
      commands.push('--headed');
      break;
    case 'debug':
      commands.push('--debug');
      break;
    case 'ui':
      commands.push('--ui');
      break;
    // headless는 기본값이므로 추가 옵션 불필요
  }

  // 재시도 설정
  if (retries > 0) {
    commands.push('--retries', retries.toString());
  }

  // 프로젝트 (브라우저) 지정
  if (project) {
    commands.push('--project', project);
  }

  // Worker 수 지정
  if (workers !== undefined) {
    commands.push('--workers', workers.toString());
  }

  // JSON 리포터 추가 (파싱용)
  commands.push('--reporter=json');

  const command = commands.join(' ');

  let rawOutput = '';
  let errorOutput = '';
  let exitCode = 0;

  try {
    // 환경 변수 설정
    const env = {
      ...process.env,
      BASE_URL: baseURL,
      PWTEST_TIMEOUT: timeout.toString(),
    };

    rawOutput = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout,
      env,
      stdio: 'pipe',
    });
  } catch (error: any) {
    exitCode = error.status || 1;
    rawOutput = error.stdout?.toString() || '';
    errorOutput = error.stderr?.toString() || '';
  }

  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();

  // 결과 파싱
  const result = parsePlaywrightOutput(
    rawOutput,
    errorOutput,
    exitCode === 0,
    startTime,
    endTime,
    duration,
    projectRoot
  );

  return result;
}

/**
 * Playwright JSON 출력을 파싱하여 구조화된 결과로 변환
 */
function parsePlaywrightOutput(
  rawOutput: string,
  errorOutput: string,
  success: boolean,
  startTime: Date,
  endTime: Date,
  duration: number,
  projectRoot: string
): E2ETestResult {
  const tests: TestResult[] = [];
  const screenshots: string[] = [];
  const videos: string[] = [];

  let stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    timedOut: 0,
  };

  try {
    // JSON 리포터 출력 파싱
    const jsonMatch = rawOutput.match(/\{[\s\S]*"suites"[\s\S]*\}/);
    if (jsonMatch) {
      const report = JSON.parse(jsonMatch[0]);

      // 테스트 결과 추출
      if (report.suites) {
        extractTestsFromSuites(report.suites, tests, screenshots, videos, projectRoot);
      }

      // 통계 계산
      stats = {
        total: tests.length,
        passed: tests.filter((t) => t.status === 'passed').length,
        failed: tests.filter((t) => t.status === 'failed').length,
        skipped: tests.filter((t) => t.status === 'skipped').length,
        timedOut: tests.filter((t) => t.status === 'timedOut').length,
      };
    } else {
      // JSON 파싱 실패 시 텍스트 기반 파싱
      parseTextOutput(rawOutput, tests, stats);
    }
  } catch (error) {
    console.error('Failed to parse Playwright output:', error);
    // 파싱 실패 시에도 기본 정보는 반환
  }

  // HTML 리포트 경로
  const reportPath = path.join(projectRoot, 'playwright-report', 'index.html');

  return {
    success,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
    stats,
    tests,
    screenshots: [...new Set(screenshots)], // 중복 제거
    videos: [...new Set(videos)],
    reportPath: fs.existsSync(reportPath) ? reportPath : undefined,
    rawOutput,
    errorOutput,
  };
}

/**
 * Playwright JSON 리포트에서 테스트 결과 재귀 추출
 */
function extractTestsFromSuites(
  suites: any[],
  tests: TestResult[],
  screenshots: string[],
  videos: string[],
  projectRoot: string
): void {
  for (const suite of suites) {
    // 하위 suite 재귀 처리
    if (suite.suites && suite.suites.length > 0) {
      extractTestsFromSuites(suite.suites, tests, screenshots, videos, projectRoot);
    }

    // 테스트 케이스 처리
    if (suite.specs) {
      for (const spec of suite.specs) {
        const file = spec.file || suite.file || 'unknown';
        const title = spec.title || spec.ok ? 'passed' : 'failed';

        for (const test of spec.tests || []) {
          const testResult: TestResult = {
            file: path.relative(projectRoot, file),
            name: title,
            status: mapStatus(test.status),
            duration: test.results?.[0]?.duration || 0,
          };

          // 에러 정보
          if (test.results?.[0]?.error) {
            testResult.error = test.results[0].error.message || test.results[0].error.toString();
          }

          // 스크린샷 수집
          if (test.results?.[0]?.attachments) {
            const screenshotAttachments = test.results[0].attachments.filter(
              (a: any) => a.name === 'screenshot' && a.path
            );
            testResult.screenshots = screenshotAttachments.map((a: any) => a.path);
            screenshots.push(...testResult.screenshots);
          }

          // 비디오 수집
          if (test.results?.[0]?.attachments) {
            const videoAttachments = test.results[0].attachments.filter(
              (a: any) => a.name === 'video' && a.path
            );
            if (videoAttachments.length > 0) {
              testResult.video = videoAttachments[0].path;
              videos.push(testResult.video);
            }
          }

          tests.push(testResult);
        }
      }
    }
  }
}

/**
 * Playwright 상태를 표준 상태로 매핑
 */
function mapStatus(status: string): TestResult['status'] {
  switch (status?.toLowerCase()) {
    case 'passed':
      return 'passed';
    case 'failed':
      return 'failed';
    case 'skipped':
      return 'skipped';
    case 'timedout':
      return 'timedOut';
    default:
      return 'failed';
  }
}

/**
 * 텍스트 출력 기반 파싱 (fallback)
 */
function parseTextOutput(
  output: string,
  tests: TestResult[],
  stats: { total: number; passed: number; failed: number; skipped: number; timedOut: number }
): void {
  // 통계 추출
  const passedMatch = output.match(/(\d+) passed/);
  const failedMatch = output.match(/(\d+) failed/);
  const skippedMatch = output.match(/(\d+) skipped/);

  if (passedMatch) stats.passed = parseInt(passedMatch[1], 10);
  if (failedMatch) stats.failed = parseInt(failedMatch[1], 10);
  if (skippedMatch) stats.skipped = parseInt(skippedMatch[1], 10);

  stats.total = stats.passed + stats.failed + stats.skipped + stats.timedOut;

  // 간단한 테스트 결과 추출 (정확하지 않을 수 있음)
  const testPattern = /\s+(✓|✗|○)\s+(.+?)\s+\((\d+)ms\)/g;
  let match;

  while ((match = testPattern.exec(output)) !== null) {
    const [, symbol, name, duration] = match;
    const status = symbol === '✓' ? 'passed' : symbol === '✗' ? 'failed' : 'skipped';

    tests.push({
      file: 'unknown',
      name: name.trim(),
      status,
      duration: parseInt(duration, 10),
    });
  }
}

/**
 * 테스트 결과를 사람이 읽기 쉬운 형식으로 포맷팅
 *
 * @param result - E2E 테스트 결과
 * @returns 포맷팅된 문자열
 */
export function formatTestResult(result: E2ETestResult): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('E2E Test Results');
  lines.push('='.repeat(60));
  lines.push('');

  // 통계
  lines.push(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  lines.push(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
  lines.push('');
  lines.push('Statistics:');
  lines.push(`  Total:    ${result.stats.total}`);
  lines.push(`  Passed:   ${result.stats.passed}`);
  lines.push(`  Failed:   ${result.stats.failed}`);
  lines.push(`  Skipped:  ${result.stats.skipped}`);
  lines.push(`  TimedOut: ${result.stats.timedOut}`);
  lines.push('');

  // 실패한 테스트 상세
  const failedTests = result.tests.filter((t) => t.status === 'failed' || t.status === 'timedOut');
  if (failedTests.length > 0) {
    lines.push('Failed Tests:');
    lines.push('-'.repeat(60));
    for (const test of failedTests) {
      lines.push(`\n[${test.status.toUpperCase()}] ${test.file} > ${test.name}`);
      if (test.error) {
        lines.push(`  Error: ${test.error}`);
      }
      if (test.screenshots && test.screenshots.length > 0) {
        lines.push(`  Screenshots: ${test.screenshots.join(', ')}`);
      }
      if (test.video) {
        lines.push(`  Video: ${test.video}`);
      }
    }
    lines.push('');
  }

  // 리포트 경로
  if (result.reportPath) {
    lines.push(`HTML Report: ${result.reportPath}`);
    lines.push('');
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * 특정 테스트만 재실행 (실패한 테스트 재실행용)
 *
 * @param testFile - 테스트 파일 경로
 * @param testName - 테스트 이름 (옵션)
 * @param options - 추가 옵션
 */
export async function retryFailedTest(
  testFile: string,
  testName?: string,
  options: Omit<E2ETestOptions, 'pattern'> = {}
): Promise<E2ETestResult> {
  let pattern = testFile;

  // 특정 테스트 이름이 지정된 경우 grep 사용
  if (testName) {
    pattern = `${testFile} --grep "${testName}"`;
  }

  return runE2ETests({
    ...options,
    pattern,
  });
}

export default runE2ETests;
