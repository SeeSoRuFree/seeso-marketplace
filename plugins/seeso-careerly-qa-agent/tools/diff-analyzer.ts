/**
 * Git Diff Analyzer Tool
 *
 * Git diff를 분석하여 변경된 파일을 추출하고,
 * 파일 유형별 분류 및 영향 범위를 추론합니다.
 */

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Diff 분석 옵션
 */
export interface DiffAnalyzerOptions {
  /**
   * 비교 기준 브랜치/커밋
   * @default 'main'
   */
  base?: string;

  /**
   * 비교 대상 브랜치/커밋
   * @default 'HEAD'
   */
  head?: string;

  /**
   * 프로젝트 루트 경로
   * @default '/Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2'
   */
  projectRoot?: string;

  /**
   * 상세 분석 포함 여부 (파일 내용 변경 사항)
   * @default false
   */
  includeDetails?: boolean;

  /**
   * 특정 파일 패턴만 분석 (glob)
   * 예: '*.ts', 'src/**\/*.tsx'
   */
  filePattern?: string;
}

/**
 * 파일 변경 유형
 */
export type ChangeType = 'added' | 'modified' | 'deleted' | 'renamed';

/**
 * 파일 카테고리
 */
export type FileCategory =
  | 'frontend'
  | 'backend'
  | 'test'
  | 'config'
  | 'documentation'
  | 'database'
  | 'api'
  | 'component'
  | 'style'
  | 'hook'
  | 'utility'
  | 'type'
  | 'unknown';

/**
 * 개별 파일 변경 정보
 */
export interface FileChange {
  /**
   * 파일 경로 (프로젝트 루트 기준 상대 경로)
   */
  path: string;

  /**
   * 변경 유형
   */
  changeType: ChangeType;

  /**
   * 파일 카테고리
   */
  category: FileCategory;

  /**
   * 추가된 라인 수
   */
  additions: number;

  /**
   * 삭제된 라인 수
   */
  deletions: number;

  /**
   * 이전 파일 경로 (renamed인 경우)
   */
  previousPath?: string;

  /**
   * 파일 확장자
   */
  extension: string;

  /**
   * 변경 내용 상세 (includeDetails가 true인 경우)
   */
  details?: string;
}

/**
 * 영향받는 모듈/컴포넌트
 */
export interface AffectedModule {
  /**
   * 모듈/컴포넌트 이름
   */
  name: string;

  /**
   * 모듈 유형
   */
  type: 'page' | 'component' | 'api' | 'service' | 'utility' | 'hook' | 'test' | 'other';

  /**
   * 변경된 파일 목록
   */
  files: string[];

  /**
   * 영향도 (low, medium, high)
   */
  impact: 'low' | 'medium' | 'high';
}

/**
 * Diff 분석 결과
 */
export interface DiffAnalysisResult {
  /**
   * 비교 정보
   */
  comparison: {
    base: string;
    head: string;
    baseSha: string;
    headSha: string;
  };

  /**
   * 전체 통계
   */
  stats: {
    totalFiles: number;
    additions: number;
    deletions: number;
    byChangeType: Record<ChangeType, number>;
    byCategory: Record<FileCategory, number>;
  };

  /**
   * 변경된 파일 목록
   */
  files: FileChange[];

  /**
   * 카테고리별 파일 분류
   */
  filesByCategory: Record<FileCategory, FileChange[]>;

  /**
   * 영향받는 모듈/컴포넌트
   */
  affectedModules: AffectedModule[];

  /**
   * 테스트 영향 분석
   */
  testImpact: {
    /**
     * 테스트 파일이 변경되었는지
     */
    testFilesChanged: boolean;

    /**
     * 실행해야 할 테스트 추천
     */
    recommendedTests: string[];

    /**
     * 영향받는 테스트 파일
     */
    affectedTestFiles: string[];
  };

  /**
   * 배포 영향 분석
   */
  deploymentImpact: {
    /**
     * Frontend 변경 여부
     */
    frontendChanged: boolean;

    /**
     * Backend 변경 여부
     */
    backendChanged: boolean;

    /**
     * Database 스키마 변경 여부
     */
    databaseChanged: boolean;

    /**
     * 설정 파일 변경 여부
     */
    configChanged: boolean;

    /**
     * API 인터페이스 변경 여부
     */
    apiChanged: boolean;
  };

  /**
   * 원본 diff 출력
   */
  rawDiff: string;
}

/**
 * Git diff를 분석하고 변경 사항을 구조화합니다.
 *
 * @param options - Diff 분석 옵션
 * @returns 구조화된 diff 분석 결과
 *
 * @example
 * ```typescript
 * // main 브랜치와 현재 HEAD 비교
 * const result = await analyzeDiff({ base: 'main', head: 'HEAD' });
 *
 * // 특정 커밋 범위 분석
 * const result = await analyzeDiff({
 *   base: 'abc123',
 *   head: 'def456'
 * });
 *
 * // TypeScript 파일만 분석
 * const result = await analyzeDiff({
 *   base: 'main',
 *   filePattern: '*.ts'
 * });
 * ```
 */
export async function analyzeDiff(
  options: DiffAnalyzerOptions = {}
): Promise<DiffAnalysisResult> {
  const {
    base = 'main',
    head = 'HEAD',
    projectRoot = '/Users/seulchankim/projects/seeso/careerly-perflexity/careerly-v2',
    includeDetails = false,
    filePattern,
  } = options;

  // Git diff 실행
  const rawDiff = executeGitDiff(base, head, projectRoot, filePattern);

  // SHA 추출
  const baseSha = getCommitSha(base, projectRoot);
  const headSha = getCommitSha(head, projectRoot);

  // 변경된 파일 목록 추출
  const files = parseGitDiff(rawDiff, projectRoot, includeDetails);

  // 통계 계산
  const stats = calculateStats(files);

  // 카테고리별 분류
  const filesByCategory = groupByCategory(files);

  // 영향받는 모듈 추론
  const affectedModules = inferAffectedModules(files);

  // 테스트 영향 분석
  const testImpact = analyzeTestImpact(files, affectedModules);

  // 배포 영향 분석
  const deploymentImpact = analyzeDeploymentImpact(files);

  return {
    comparison: {
      base,
      head,
      baseSha,
      headSha,
    },
    stats,
    files,
    filesByCategory,
    affectedModules,
    testImpact,
    deploymentImpact,
    rawDiff,
  };
}

/**
 * Git diff 명령어 실행
 */
function executeGitDiff(
  base: string,
  head: string,
  projectRoot: string,
  filePattern?: string
): string {
  try {
    const args = ['diff', '--numstat', `${base}...${head}`];

    if (filePattern) {
      args.push('--', filePattern);
    }

    return execSync(`git ${args.join(' ')}`, {
      cwd: projectRoot,
      encoding: 'utf-8',
    });
  } catch (error: any) {
    console.error('Git diff failed:', error.message);
    return '';
  }
}

/**
 * 커밋 SHA 추출
 */
function getCommitSha(ref: string, projectRoot: string): string {
  try {
    return execSync(`git rev-parse ${ref}`, {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();
  } catch {
    return ref;
  }
}

/**
 * Git diff 출력 파싱
 */
function parseGitDiff(
  rawDiff: string,
  projectRoot: string,
  includeDetails: boolean
): FileChange[] {
  const files: FileChange[] = [];
  const lines = rawDiff.trim().split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    // Format: additions deletions filename
    const match = line.match(/^(\d+|-)\s+(\d+|-)\s+(.+)$/);
    if (!match) continue;

    const [, addStr, delStr, filePath] = match;
    const additions = addStr === '-' ? 0 : parseInt(addStr, 10);
    const deletions = delStr === '-' ? 0 : parseInt(delStr, 10);

    // 파일 이름 변경 처리 (old => new)
    let actualPath = filePath;
    let previousPath: string | undefined;
    let changeType: ChangeType = 'modified';

    if (filePath.includes('=>')) {
      const renameMatch = filePath.match(/(.+)\{(.+) => (.+)\}(.+)/);
      if (renameMatch) {
        const [, prefix, oldName, newName, suffix] = renameMatch;
        previousPath = `${prefix}${oldName}${suffix}`;
        actualPath = `${prefix}${newName}${suffix}`;
        changeType = 'renamed';
      }
    } else if (additions > 0 && deletions === 0) {
      changeType = 'added';
    } else if (additions === 0 && deletions > 0) {
      changeType = 'deleted';
    }

    const extension = path.extname(actualPath).slice(1) || 'unknown';
    const category = categorizeFile(actualPath);

    const fileChange: FileChange = {
      path: actualPath,
      changeType,
      category,
      additions,
      deletions,
      extension,
    };

    if (previousPath) {
      fileChange.previousPath = previousPath;
    }

    if (includeDetails) {
      fileChange.details = getFileDetails(actualPath, projectRoot);
    }

    files.push(fileChange);
  }

  return files;
}

/**
 * 파일을 카테고리로 분류
 */
function categorizeFile(filePath: string): FileCategory {
  const normalized = filePath.toLowerCase();

  // Test files
  if (
    normalized.includes('/e2e/') ||
    normalized.includes('/__tests__/') ||
    normalized.includes('.test.') ||
    normalized.includes('.spec.')
  ) {
    return 'test';
  }

  // Config files
  if (
    normalized.includes('config') ||
    normalized.match(/\.(config|json|yaml|yml|toml|env)$/) ||
    normalized.includes('package.json') ||
    normalized.includes('tsconfig') ||
    normalized.includes('playwright.config')
  ) {
    return 'config';
  }

  // Documentation
  if (normalized.match(/\.(md|mdx|txt)$/)) {
    return 'documentation';
  }

  // Database/Migrations
  if (normalized.includes('migration') || normalized.includes('schema')) {
    return 'database';
  }

  // Frontend specific
  if (normalized.startsWith('careerly-v2/')) {
    // API routes
    if (normalized.includes('/api/') || normalized.includes('services/')) {
      return 'api';
    }

    // Components
    if (normalized.includes('/components/')) {
      return 'component';
    }

    // Styles
    if (normalized.match(/\.(css|scss|sass|less)$/)) {
      return 'style';
    }

    // Hooks
    if (normalized.includes('/hooks/') || normalized.includes('use-')) {
      return 'hook';
    }

    // Types
    if (normalized.includes('/types/') || normalized.endsWith('.d.ts')) {
      return 'type';
    }

    // Utilities
    if (normalized.includes('/lib/') || normalized.includes('/utils/')) {
      return 'utility';
    }

    return 'frontend';
  }

  // Backend specific
  if (normalized.startsWith('careerly2-backend/')) {
    return 'backend';
  }

  return 'unknown';
}

/**
 * 파일 상세 내용 추출
 */
function getFileDetails(filePath: string, projectRoot: string): string {
  try {
    return execSync(`git diff HEAD -- "${filePath}"`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024, // 1MB
    });
  } catch {
    return '';
  }
}

/**
 * 통계 계산
 */
function calculateStats(files: FileChange[]): DiffAnalysisResult['stats'] {
  const stats: DiffAnalysisResult['stats'] = {
    totalFiles: files.length,
    additions: 0,
    deletions: 0,
    byChangeType: {
      added: 0,
      modified: 0,
      deleted: 0,
      renamed: 0,
    },
    byCategory: {
      frontend: 0,
      backend: 0,
      test: 0,
      config: 0,
      documentation: 0,
      database: 0,
      api: 0,
      component: 0,
      style: 0,
      hook: 0,
      utility: 0,
      type: 0,
      unknown: 0,
    },
  };

  for (const file of files) {
    stats.additions += file.additions;
    stats.deletions += file.deletions;
    stats.byChangeType[file.changeType]++;
    stats.byCategory[file.category]++;
  }

  return stats;
}

/**
 * 카테고리별 파일 그룹화
 */
function groupByCategory(files: FileChange[]): Record<FileCategory, FileChange[]> {
  const grouped: Record<FileCategory, FileChange[]> = {
    frontend: [],
    backend: [],
    test: [],
    config: [],
    documentation: [],
    database: [],
    api: [],
    component: [],
    style: [],
    hook: [],
    utility: [],
    type: [],
    unknown: [],
  };

  for (const file of files) {
    grouped[file.category].push(file);
  }

  return grouped;
}

/**
 * 영향받는 모듈 추론
 */
function inferAffectedModules(files: FileChange[]): AffectedModule[] {
  const modules = new Map<string, AffectedModule>();

  for (const file of files) {
    const moduleName = extractModuleName(file.path);
    const moduleType = inferModuleType(file.path, file.category);

    if (!modules.has(moduleName)) {
      modules.set(moduleName, {
        name: moduleName,
        type: moduleType,
        files: [],
        impact: 'low',
      });
    }

    const module = modules.get(moduleName)!;
    module.files.push(file.path);

    // 영향도 계산
    const currentImpact = calculateImpact(file);
    if (impactLevel(currentImpact) > impactLevel(module.impact)) {
      module.impact = currentImpact;
    }
  }

  return Array.from(modules.values());
}

/**
 * 파일 경로에서 모듈/컴포넌트 이름 추출
 */
function extractModuleName(filePath: string): string {
  // careerly-v2/app/search/page.tsx -> search
  // careerly-v2/components/ui/button.tsx -> button
  // careerly2-backend/api/views.py -> api

  const parts = filePath.split('/');

  // Frontend
  if (parts[0] === 'careerly-v2') {
    if (parts[1] === 'app' && parts.length > 2) {
      return parts[2]; // 페이지 이름
    }
    if (parts[1] === 'components' && parts.length > 2) {
      return parts[parts.length - 1].replace(/\.(tsx?|jsx?)$/, ''); // 컴포넌트 이름
    }
    return parts[1] || 'unknown';
  }

  // Backend
  if (parts[0] === 'careerly2-backend') {
    return parts[1] || 'unknown';
  }

  return 'unknown';
}

/**
 * 모듈 유형 추론
 */
function inferModuleType(
  filePath: string,
  category: FileCategory
): AffectedModule['type'] {
  if (category === 'test') return 'test';
  if (category === 'component') return 'component';
  if (category === 'api') return 'api';
  if (category === 'hook') return 'hook';
  if (category === 'utility') return 'utility';

  if (filePath.includes('/app/')) return 'page';
  if (filePath.includes('/services/')) return 'service';

  return 'other';
}

/**
 * 파일 변경의 영향도 계산
 */
function calculateImpact(file: FileChange): 'low' | 'medium' | 'high' {
  // 변경 크기
  const totalChanges = file.additions + file.deletions;

  // 카테고리별 가중치
  const criticalCategories: FileCategory[] = ['api', 'database', 'config'];
  const isCritical = criticalCategories.includes(file.category);

  if (isCritical && totalChanges > 20) return 'high';
  if (totalChanges > 100) return 'high';
  if (isCritical || totalChanges > 50) return 'medium';

  return 'low';
}

/**
 * 영향도 레벨 숫자 변환
 */
function impactLevel(impact: 'low' | 'medium' | 'high'): number {
  return { low: 1, medium: 2, high: 3 }[impact];
}

/**
 * 테스트 영향 분석
 */
function analyzeTestImpact(
  files: FileChange[],
  modules: AffectedModule[]
): DiffAnalysisResult['testImpact'] {
  const testFiles = files.filter((f) => f.category === 'test');
  const affectedTestFiles = testFiles.map((f) => f.path);

  const recommendedTests: string[] = [];

  // 변경된 테스트 파일은 당연히 실행
  recommendedTests.push(...affectedTestFiles);

  // 모듈별 추천 테스트
  for (const module of modules) {
    if (module.type === 'page') {
      // 페이지 변경 시 해당 페이지 E2E 테스트
      recommendedTests.push(`e2e/${module.name}.spec.ts`);
    } else if (module.type === 'api') {
      // API 변경 시 API 테스트
      recommendedTests.push(`**/*${module.name}*.test.ts`);
    } else if (module.impact === 'high') {
      // 영향도가 높은 변경은 smoke 테스트
      recommendedTests.push('e2e/smoke.spec.ts');
    }
  }

  // 중요 파일 변경 시 전체 smoke 테스트
  const hasCriticalChanges = files.some((f) =>
    ['api', 'database', 'config'].includes(f.category)
  );
  if (hasCriticalChanges) {
    recommendedTests.push('e2e/smoke.spec.ts');
  }

  return {
    testFilesChanged: testFiles.length > 0,
    recommendedTests: [...new Set(recommendedTests)], // 중복 제거
    affectedTestFiles,
  };
}

/**
 * 배포 영향 분석
 */
function analyzeDeploymentImpact(
  files: FileChange[]
): DiffAnalysisResult['deploymentImpact'] {
  return {
    frontendChanged: files.some((f) => f.path.startsWith('careerly-v2/')),
    backendChanged: files.some((f) => f.path.startsWith('careerly2-backend/')),
    databaseChanged: files.some((f) => f.category === 'database'),
    configChanged: files.some((f) => f.category === 'config'),
    apiChanged: files.some((f) => f.category === 'api'),
  };
}

/**
 * Diff 분석 결과를 사람이 읽기 쉬운 형식으로 포맷팅
 *
 * @param result - Diff 분석 결과
 * @returns 포맷팅된 문자열
 */
export function formatDiffAnalysis(result: DiffAnalysisResult): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('Git Diff Analysis');
  lines.push('='.repeat(60));
  lines.push('');

  // 비교 정보
  lines.push('Comparison:');
  lines.push(`  Base: ${result.comparison.base} (${result.comparison.baseSha.slice(0, 7)})`);
  lines.push(`  Head: ${result.comparison.head} (${result.comparison.headSha.slice(0, 7)})`);
  lines.push('');

  // 통계
  lines.push('Statistics:');
  lines.push(`  Total Files: ${result.stats.totalFiles}`);
  lines.push(`  Additions:   +${result.stats.additions}`);
  lines.push(`  Deletions:   -${result.stats.deletions}`);
  lines.push('');

  lines.push('By Change Type:');
  for (const [type, count] of Object.entries(result.stats.byChangeType)) {
    if (count > 0) {
      lines.push(`  ${type.padEnd(10)}: ${count}`);
    }
  }
  lines.push('');

  lines.push('By Category:');
  for (const [category, count] of Object.entries(result.stats.byCategory)) {
    if (count > 0) {
      lines.push(`  ${category.padEnd(15)}: ${count}`);
    }
  }
  lines.push('');

  // 영향받는 모듈
  if (result.affectedModules.length > 0) {
    lines.push('Affected Modules:');
    lines.push('-'.repeat(60));
    for (const module of result.affectedModules) {
      lines.push(
        `  [${module.impact.toUpperCase()}] ${module.name} (${module.type}) - ${module.files.length} files`
      );
    }
    lines.push('');
  }

  // 테스트 영향
  lines.push('Test Impact:');
  lines.push(`  Test Files Changed: ${result.testImpact.testFilesChanged ? 'Yes' : 'No'}`);
  if (result.testImpact.recommendedTests.length > 0) {
    lines.push('  Recommended Tests:');
    for (const test of result.testImpact.recommendedTests) {
      lines.push(`    - ${test}`);
    }
  }
  lines.push('');

  // 배포 영향
  lines.push('Deployment Impact:');
  lines.push(`  Frontend:  ${result.deploymentImpact.frontendChanged ? 'Yes' : 'No'}`);
  lines.push(`  Backend:   ${result.deploymentImpact.backendChanged ? 'Yes' : 'No'}`);
  lines.push(`  Database:  ${result.deploymentImpact.databaseChanged ? 'Yes' : 'No'}`);
  lines.push(`  Config:    ${result.deploymentImpact.configChanged ? 'Yes' : 'No'}`);
  lines.push(`  API:       ${result.deploymentImpact.apiChanged ? 'Yes' : 'No'}`);
  lines.push('');

  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * 특정 카테고리의 파일만 필터링하여 분석
 *
 * @param result - 전체 분석 결과
 * @param categories - 필터링할 카테고리 목록
 * @returns 필터링된 파일 목록
 */
export function filterByCategories(
  result: DiffAnalysisResult,
  categories: FileCategory[]
): FileChange[] {
  return result.files.filter((f) => categories.includes(f.category));
}

/**
 * 영향도별 모듈 필터링
 *
 * @param result - 전체 분석 결과
 * @param impacts - 필터링할 영향도 레벨
 * @returns 필터링된 모듈 목록
 */
export function filterByImpact(
  result: DiffAnalysisResult,
  impacts: Array<'low' | 'medium' | 'high'>
): AffectedModule[] {
  return result.affectedModules.filter((m) => impacts.includes(m.impact));
}

export default analyzeDiff;
