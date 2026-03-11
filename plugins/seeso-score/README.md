# seeso-score

프로젝트 완성도 측정 시스템. 3개 독립 종목으로 점수를 매긴다.

## 3종목

| 종목 | 질문 | 방식 |
|------|------|------|
| **QC** | 유저가 쓸 수 있나? | 체크리스트 기반 시나리오 검증 |
| **Code** | 코드가 건강한가? | 빌드+린트+테스트 자동 실행 |
| **Ready** | 런칭 준비 됐나? | AI가 코드 읽고 판단 |

## 사용법

```
seeso-score qc       # QC만
seeso-score code     # Code만
seeso-score ready    # Ready만
seeso-score all      # 3종목 전부
```

## 설치

이 디렉토리를 프로젝트의 `.claude/plugins/` 또는 `~/.claude/skills/`에 복사.

## 커스터마이징

- QC: 프로젝트별 체크리스트(CSV/MD) 작성
- Code: package.json / pyproject.toml 스크립트 자동 감지
- Ready: `criteria/ready.md` 복사 후 프로젝트에 맞게 수정
