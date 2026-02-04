---
description: 태재대학교 입학처 웹사이트 유지보수 워크플로우 관리
---

# Workflow Command

태재대학교 입학처 웹사이트 유지보수 워크플로우를 관리하는 메인 명령어입니다.

## 사용법

```bash
/workflow                        # 도움말 및 현재 상태
/workflow start <파일경로>       # 새 워크플로우 시작
/workflow ticket                 # 티켓 생성 단계
/workflow classify               # 티켓 분류 단계
/workflow develop                # 로컬 개발 단계
/workflow deploy                 # 배포 및 통보 단계
/workflow status                 # 현재 상태 확인
```

## 워크플로우 흐름

이 명령어를 실행하면 다음 워크플로우 스킬이 호출됩니다:
- `skills/taejae-workflow/SKILL.md`

### 단계별 실행

1. **요청 수집** (`/workflow start`)
   - 고객 요청 파일 분석 (PPT, 이미지, 텍스트)
   - 요청 사항 구조화
   - CHECKPOINT-1: 분석된 요청 목록 확인

2. **티켓 생성** (`/workflow ticket`)
   - Notion 티켓 생성
   - 고객 관점 검토
   - CHECKPOINT-2: 티켓 + 검토 결과 확인

3. **분류/검토** (`/workflow classify`)
   - 난이도/배포가능/타입 분류
   - 개발팀 관점 검토
   - CHECKPOINT-3: 분류 결과 확인

4. **로컬 개발** (`/workflow develop`)
   - 코드 수정
   - 로컬 테스트
   - CHECKPOINT-4: 변경사항 확인 및 로컬 검증

5. **배포/통보** (`/workflow deploy`)
   - 프로덕션 빌드
   - 고객 통보 메일 초안 작성
   - CHECKPOINT-5: 메일 확인

## 예시

```bash
# 고객 요청 파일로 워크플로우 시작
/workflow start ~/Downloads/고객요청_20250130.pptx

# 현재 진행 상태 확인
/workflow status

# 특정 단계 수동 실행
/workflow develop
```

## 상태 관리

워크플로우 상태는 `.workflow/` 디렉토리에 저장됩니다:
- `current-state.json` - 현재 워크플로우 상태
- `requests.json` - 분석된 요청 목록
- `tickets.json` - 생성된 티켓 정보
