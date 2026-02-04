# MVP Prototype Plugin

회의록/기획 자료 분석부터 MVP 프로토타입 빌드, Vercel 배포까지 전체 워크플로우를 자동화하는 플러그인입니다.

## 설치

```bash
/plugin install mvp-prototype@seeso
```

## 사용법

### 전체 워크플로우

```bash
/mvp-prototype:mvp full ~/Downloads/회의록.md
```

### 단계별 실행

```bash
# 1. 회의록 분석
/mvp-prototype:mvp analyze ~/Downloads/회의록.md

# 2. 디자인 스타일 선택
/mvp-prototype:mvp design

# 3. Open Questions 해결
/mvp-prototype:mvp validate

# 4. MVP 빌드
/mvp-prototype:mvp build v2

# 5. Vercel 배포
/mvp-prototype:mvp deploy

# 상태 확인
/mvp-prototype:mvp status
```

## 워크플로우 단계

| 단계 | 설명 | 출력 |
|------|------|------|
| Analyze | 회의록/기획 자료 분석 | `.mvp/planning.json` |
| Design | 3가지 디자인 스타일 제안 | `.mvp/designs/` |
| Validate | Open Questions 해결 | planning.json 업데이트 |
| Build | React + Vite MVP 빌드 | `mvp/` 폴더 |
| Deploy | Vercel 배포 | 배포 URL |

## 기술 스택

빌드되는 MVP:
- React 18 + Vite
- Tailwind CSS v4
- React Router DOM
- LocalStorage 기반 데이터 영속화

## 에이전트

- `product-planner` - 서비스 기획자
- `customer-advocate` - 고객 의도 검증
- `design-director` - 디자인 스타일 제안
- `pre-build-validator` - 빌드 전 검증

## 버전

- **v1.1.0** - Validate 단계 추가, Open Questions 해결 필수화
- **v1.0.0** - 초기 버전

## 라이선스

MIT
