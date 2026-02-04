# taejae-workflow

태재대학교 입학처 웹사이트 유지보수 워크플로우를 관리하는 메인 스킬입니다.

## 트리거

- `/workflow` - 워크플로우 도움말
- `/workflow start <파일경로>` - 새 워크플로우 시작
- `/workflow ticket` - 티켓 생성 단계
- `/workflow classify` - 티켓 분류 단계
- `/workflow develop` - 로컬 개발 단계
- `/workflow deploy` - 배포 및 통보 단계
- `/workflow status` - 현재 상태 확인

## 워크플로우 개요

고객 요청 수집부터 배포 및 통보까지 5단계 자동화 워크플로우:

```
[1] 요청 수집 → [2] 티켓 생성 → [3] 분류/검토 → [4] 로컬 개발 → [5] 배포/통보
    (파일분석)     (Notion저장)    (난이도분류)     (코드수정)      (메일초안)
        ↓              ↓              ↓              ↓              ↓
    사용자확인      고객관점검토    개발팀검토     변경사항설명    메일확인
```

## 사용자 확인 포인트 (Checkpoints)

각 단계 완료 후 사용자 확인을 요청합니다:

| 체크포인트 | 확인 내용 | 사용자 액션 |
|-----------|----------|------------|
| CHECKPOINT-1 | 분석된 요청 목록 | 확인/추가요청 |
| CHECKPOINT-2 | 생성된 티켓 + 고객 검토 결과 | 승인/수정요청 |
| CHECKPOINT-3 | 분류 결과 + 개발팀 검토 | 확인/재분류 |
| CHECKPOINT-4 | 변경사항 설명 + 로컬 확인 요청 | 배포/수정필요 |
| CHECKPOINT-5 | 고객 통보 메일 초안 | 확인(수동복사) |

## 단계별 실행 가이드

### 1단계: 요청 수집 (`/workflow start`)

**입력**: 고객 요청 파일 (PPT, 이미지, 텍스트 등)

**처리**:
1. `customer-request-analyzer` 에이전트로 파일 분석
2. 요청 사항을 구조화된 JSON으로 변환
3. 우선순위 및 카테고리 자동 분류

**출력**: 분석된 요청 목록

**CHECKPOINT-1**:
```
📋 분석된 요청 목록을 확인해주세요:
[분석 결과 표시]

옵션:
- "확인" → 다음 단계 진행
- "추가요청 있음" → 추가 요청 입력
- "수정 필요" → 특정 항목 수정
```

### 2단계: 티켓 생성 (`/workflow ticket`)

**처리**:
1. 분석된 요청을 Notion 티켓으로 변환
2. `taejae-ticket-manager` 스킬로 Notion DB에 저장
3. `customer-reviewer` 에이전트로 고객 관점 검토

**출력**: 생성된 티켓 + 고객 관점 검토 결과

**CHECKPOINT-2**:
```
🎫 티켓이 생성되었습니다:
[티켓 정보]

👤 고객 관점 검토 결과:
[검토 결과]

옵션:
- "승인" → 다음 단계 진행
- "수정 필요" → 티켓 수정
```

### 3단계: 분류/검토 (`/workflow classify`)

**처리**:
1. 난이도/배포가능여부/타입 자동 분류
2. `dev-team-reviewer` 에이전트로 기술 검토

**분류 기준**:
- 난이도: `easy` / `medium` / `hard`
- 배포: `immediate` / `scheduled` / `requires_review`
- 타입: `frontend` / `backend` / `content` / `both`

**CHECKPOINT-3**:
```
📊 분류 결과:
- 난이도: [분류]
- 배포 가능: [분류]
- 타입: [분류]

🔧 개발팀 검토 결과:
[기술 검토 내용]

옵션:
- "확인" → 개발 시작
- "재분류" → 분류 수정
```

### 4단계: 로컬 개발 (`/workflow develop`)

**처리**:
1. 티켓 요구사항에 따른 코드 수정
2. 로컬 빌드 및 테스트
3. `changelog-writer` 에이전트로 변경사항 설명

**CHECKPOINT-4**:
```
✅ 개발 완료:
[변경 파일 목록]

📝 변경사항 설명 (비개발자용):
[변경 내용 설명]

🔍 로컬에서 확인해주세요:
- npm start로 개발 서버 실행
- [확인 포인트 목록]

옵션:
- "배포 진행" → 배포 단계
- "수정 필요" → 추가 수정
```

### 5단계: 배포/통보 (`/workflow deploy`)

**처리**:
1. 프로덕션 빌드 생성
2. 배포 가이드 제공
3. `taejae-deploy-notify` 스킬로 고객 메일 초안 작성

**CHECKPOINT-5**:
```
🚀 배포 준비 완료:
- build/ 폴더 생성됨
- FTP 업로드 대기 중

📧 고객 통보 메일 초안:
[메일 내용]

메일 내용을 확인 후 수동으로 복사하여 발송해주세요.
```

## 상태 관리

워크플로우 상태는 `.workflow/` 디렉토리에 임시 저장됩니다:
- `current-state.json` - 현재 워크플로우 상태
- `requests.json` - 분석된 요청 목록
- `tickets.json` - 생성된 티켓 정보

최종 티켓 정보는 Notion DB에 영구 저장됩니다.

## 관련 스킬/에이전트

- `customer-request-analyzer` - 요청 파일 분석
- `taejae-ticket-manager` - Notion 티켓 관리
- `taejae-deploy-notify` - 배포 통보 메일
- `customer-reviewer` - 고객 관점 검토
- `dev-team-reviewer` - 개발팀 관점 검토
- `changelog-writer` - 변경사항 설명

## 예시

```bash
# 전체 워크플로우 시작
/workflow start ~/Downloads/고객요청_20250130.pptx

# 현재 상태 확인
/workflow status

# 특정 단계만 실행
/workflow develop
```
