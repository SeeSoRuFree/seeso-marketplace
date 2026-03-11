# Code 워크플로우

## 목적
코드 품질을 자동 커맨드로 측정

## 실행 순서

### Step 1: 프로젝트 감지
프로젝트 루트에서 스택 자동 감지:
- `package.json` → Node/Frontend 프로젝트
- `pyproject.toml` 또는 `requirements.txt` → Python 프로젝트
- 둘 다 있으면 → 풀스택 (각각 실행)

### Step 2: Frontend 체크 (package.json 존재 시)
package.json의 scripts에서 가용 커맨드 확인 후 실행:

```bash
# 필수
pnpm build        # 또는 npm run build, yarn build

# 있으면 실행
pnpm lint          # lint 스크립트
pnpm test          # test 스크립트
pnpm test:coverage # coverage 스크립트
```

### Step 3: Backend 체크 (pyproject.toml 존재 시)
```bash
# 필수
uv run pytest      # 또는 pytest, python -m pytest

# 있으면 실행
uv run mypy app/   # 타입 체크
uv run ruff check .  # 린터
```

### Step 4: 결과 수집 및 출력
각 커맨드의 exit code와 출력에서 수치 추출:
- 빌드: pass/fail
- 린트: pass/fail + 경고 수
- 테스트: 통과/전체
- 커버리지: %

```
Code: 빌드 ✓  린트 ✓  테스트 [pass]/[total] ([%])  커버리지 [%]
├── Frontend: build ✓, lint ✓, test [n]/[m]
└── Backend:  pytest [n]/[m], mypy ✓, ruff ✓
```
