# Seeso Marketplace

Seeso 개발 자동화 플러그인 모음입니다.

## 설치 방법

### 1. 마켓플레이스 추가

```bash
/plugin marketplace add SeeSoRuFree/seeso-marketplace
```

### 2. 플러그인 설치

```bash
/plugin install seeso-commit-and-deploy@seeso
```

## 플러그인 목록

| 플러그인 | 설명 | 명령어 |
|---------|------|--------|
| **seeso-commit-and-deploy** | 커밋 및 배포 자동화 - 인프라 감지, 작업 분석, 브랜치 관리, 배포 실행 | `/seeso-commit-and-deploy:run` |
| **taejae-workflow** | 태재대학교 입학처 웹사이트 유지보수 워크플로우 - 요청 분석, Notion 티켓 관리, 배포 통보 자동화 | `/taejae-workflow:workflow` |
| **mvp-prototype** | 회의록/기획 자료 분석부터 MVP 빌드, Vercel 배포까지 자동화 | `/mvp-prototype:mvp` |
| **prototype-analyzer** | React/Next.js 프로토타입 분석 - IA, 화면 목록, 갭/정책 분석 | `/prototype-analyzer:analyze-prototype` |

## 플러그인 상세

### seeso-commit-and-deploy

커밋 및 배포 프로세스를 자동화합니다.

**기능:**
- 인프라 자동 감지 (Vercel, AWS, Kubernetes 등)
- 변경 내용 분석 (Hotfix/Bugfix/Feature 판단)
- Mock/TODO 코드 검출
- Git author 자동 설정 (Vercel 배포용)
- 브랜치 분리 → 머지 자동화

**사용법:**
```bash
/seeso-commit-and-deploy:run
```

### taejae-workflow

태재대학교 입학처 웹사이트 유지보수 워크플로우를 관리합니다.

**기능:**
- 고객 요청 파일 분석 (PPT, 이미지, 텍스트)
- Notion 티켓 자동 생성 및 관리
- 난이도/배포가능/타입 자동 분류
- 5단계 체크포인트 워크플로우
- 배포 통보 이메일 초안 생성

**명령어:**
```bash
/taejae-workflow:workflow start <파일경로>  # 워크플로우 시작
/taejae-workflow:ticket create              # 티켓 생성
/taejae-workflow:deploy-notify              # 배포 통보 메일 작성
```

### mvp-prototype

회의록/기획 자료 분석부터 MVP 프로토타입 빌드, Vercel 배포까지 전체 워크플로우를 자동화합니다.

**기능:**
- 회의록/기획 자료 분석 → 기획 문서 생성
- 3가지 디자인 스타일 제안 및 선택
- Open Questions 해결 (빌드 전 검증)
- React + Vite MVP 빌드
- Vercel 배포 (선택)

**사용법:**
```bash
/mvp-prototype:mvp full ~/Downloads/회의록.md
```

### prototype-analyzer

React/Next.js 프로토타입을 분석하여 프로덕션 전환에 필요한 항목을 정리합니다.

**기능:**
- Information Architecture (IA) 분석
- 화면 목록 (페이지, 컴포넌트, 모달)
- 갭 분석 (미구현 기능, 끊어진 링크, 목업 데이터)
- 정책 분석 (비즈니스 정책 결정 필요 항목)
- 우선순위별 액션 플랜

**사용법:**
```bash
/prototype-analyzer:analyze-prototype /path/to/my-app
```

## 팀 프로젝트 자동 설정

프로젝트의 `.claude/settings.json`에 추가:

```json
{
  "extraKnownMarketplaces": {
    "seeso": {
      "source": {
        "source": "github",
        "repo": "SeeSoRuFree/seeso-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "seeso-commit-and-deploy@seeso": true
  }
}
```

## 기여

새 플러그인 추가 시 `plugins/` 폴더에 플러그인 디렉토리를 만들고, `.claude-plugin/marketplace.json`의 `plugins` 배열에 등록하세요.

## 라이선스

MIT
