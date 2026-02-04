---
name: mvp
description: MVP 프로토타입 빌드 워크플로우 실행
---

# /mvp 명령어

MVP 프로토타입 빌드 워크플로우를 실행합니다.

## 사용법

```
/mvp [명령어] [인자]
```

## 명령어

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `analyze <파일>` | 회의록/기획 자료 분석 | `/mvp analyze ./meeting.txt` |
| `design` | 디자인 스타일 제안 및 선택 | `/mvp design` |
| `validate` | Open Questions 해결 | `/mvp validate` |
| `build [버전]` | MVP 빌드 실행 | `/mvp build v2` |
| `deploy` | Vercel 배포 | `/mvp deploy` |
| `full <파일>` | 전체 워크플로우 | `/mvp full ./meeting.txt` |
| `status` | 현재 상태 확인 | `/mvp status` |

## 워크플로우 단계

1. **Analyze** - 회의록 분석 → `.mvp/planning.json` 생성
2. **Design** - 3가지 디자인 스타일 제안 → 선택
3. **Validate** - Open Questions 해결 (빌드 전 필수)
4. **Build** - React + Vite MVP 빌드
5. **Deploy** - Vercel 배포 (선택)

## 예시

```bash
# 새 프로젝트 시작 (전체 워크플로우)
/mvp full ~/Downloads/회의록.md

# 단계별 실행
/mvp analyze ~/Downloads/회의록.md
/mvp design
/mvp validate
/mvp build v2
/mvp deploy

# 상태 확인
/mvp status
```

## 관련 스킬

이 명령어는 `mvp-prototype` 스킬을 실행합니다.
상세 문서: `skills/mvp-prototype/SKILL.md`
