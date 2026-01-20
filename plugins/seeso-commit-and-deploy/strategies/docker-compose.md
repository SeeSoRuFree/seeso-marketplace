# Docker Compose 배포 전략

## 개요

Docker Compose를 사용한 단일 서버 또는 개발 환경 배포입니다.

## 사전 조건 확인

```bash
# Docker 설치 확인
which docker || echo "Docker not installed"

# Docker Compose 설치 확인
docker compose version || docker-compose --version

# Docker 데몬 상태
docker info
```

## 설정 파일 확인

```bash
# compose 파일 확인
ls docker-compose*.yml docker-compose*.yaml 2>/dev/null

# 환경별 파일 확인
ls docker-compose.override.yml docker-compose.prod.yml 2>/dev/null
```

## 로컬/개발 환경 배포

```bash
# 기본 배포 (docker-compose.yml 사용)
docker compose up -d

# 빌드 후 배포
docker compose up -d --build

# 특정 서비스만 재배포
docker compose up -d --build {service-name}
```

## Staging 배포

```bash
# staging 설정 파일 사용
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build

# 또는 환경 변수로 지정
COMPOSE_FILE=docker-compose.yml:docker-compose.staging.yml docker compose up -d --build
```

## Production 배포

### 원격 서버 배포

```bash
# SSH를 통한 배포
ssh {user}@{server} "cd /path/to/project && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
```

### Docker Context 사용

```bash
# 원격 컨텍스트 설정
docker context create production --docker "host=ssh://user@server"

# 컨텍스트 전환 후 배포
docker context use production
docker compose up -d --build
```

### CI/CD 연동

```bash
# GitHub Actions에서 원격 배포 (예시)
# 1. SSH 키 설정
# 2. 원격 서버에서 docker compose pull && docker compose up -d
```

## 배포 상태 확인

```bash
# 컨테이너 상태
docker compose ps

# 로그 확인
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f {service-name}

# 리소스 사용량
docker stats
```

## 롤백

### 이전 이미지로 롤백

```bash
# 현재 이미지 태그 확인
docker compose images

# 이전 이미지로 변경 (docker-compose.yml 수정 또는)
docker compose pull {service}:{previous-tag}
docker compose up -d
```

### Git 기반 롤백

```bash
# 이전 커밋으로 체크아웃
git checkout {previous-commit}

# 재빌드 및 배포
docker compose up -d --build
```

## 트러블슈팅

### 컨테이너 시작 실패

```bash
# 상세 로그
docker compose logs {service-name}

# 컨테이너 상태 확인
docker inspect {container-id}
```

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :{port}
netstat -tlnp | grep :{port}
```

### 볼륨 문제

```bash
# 볼륨 목록
docker volume ls

# 볼륨 정리
docker compose down -v  # 주의: 데이터 삭제됨
```

## 유용한 명령어

```bash
# 전체 재시작
docker compose restart

# 서비스 스케일링
docker compose up -d --scale {service}=3

# 이미지 업데이트
docker compose pull
docker compose up -d

# 정리
docker compose down
docker system prune -f
```
