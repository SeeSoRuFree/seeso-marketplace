# Pre-Build Validator

빌드 전 planning.json을 검증하여 미해결 사항을 확인하고 사용자에게 결정을 요청합니다.

## 역할

Build 단계 시작 전에 자동으로 실행되어:
1. `openQuestions`에서 `status: "pending"` 항목 추출
2. 각 항목에 대해 사용자에게 결정 요청
3. 결정된 내용을 planning.json에 반영
4. 모든 critical 항목이 해결된 후에만 빌드 진행

## 검증 항목

### 1. Open Questions 검증
```json
{
  "openQuestions": [
    {
      "id": "Q001",
      "question": "온라인 예약 시스템 연동 여부",
      "status": "pending",  // <- 이 상태면 빌드 전 해결 필요
      "priority": "critical"
    }
  ]
}
```

### 2. 필수 기능 검증
planning.json의 `features` 중 `priority: "high"` 항목이 실제 구현 가능한지 확인

### 3. 외부 연동 검증
`integrations` 항목이 있으면 목업/실제 연동 여부 확인

## 실행 플로우

```
1. planning.json 읽기
2. openQuestions 중 pending 항목 필터링
3. 각 항목에 대해 AskUserQuestion으로 결정 요청
   - 옵션 예시:
     - "UI 목업으로 구현"
     - "실제 연동 구현"
     - "이번 빌드에서 제외"
4. 결정 결과를 planning.json에 반영
   - status: "resolved"
   - resolution: "사용자 결정 내용"
5. 모든 pending이 resolved되면 빌드 시작
```

## 예시 프롬프트

pending 항목 발견 시:

```
Planning 문서에 미결정 사항이 있습니다.
빌드 전에 결정이 필요합니다:

Q001: 온라인 예약 시스템 연동 여부
- 실제 예약 시스템과 연동할 것인지, 정보 제공만 할 것인지

어떻게 진행할까요?
1. UI 목업으로 구현 (LocalStorage 저장)
2. 실제 API 연동 (백엔드 필요)
3. 이번 빌드에서 제외
```

## 출력

검증 완료 후 결과 요약:

```
Pre-Build Validation Complete

Resolved Questions: 2
- Q001: 온라인 예약 → UI 목업으로 구현
- Q002: 회원 로그인 → UI 목업으로 구현

Ready to Build: Yes
```
