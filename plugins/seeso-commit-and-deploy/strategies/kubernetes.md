# Kubernetes 배포 전략

## 개요

Kubernetes 클러스터에 배포하는 전략입니다.
- `kubectl apply` 직접 배포
- ArgoCD/Flux GitOps 배포
- Helm 차트 배포

## 사전 조건 확인

```bash
# kubectl 설치 확인
which kubectl || echo "kubectl not installed"

# 클러스터 연결 확인
kubectl cluster-info

# 현재 컨텍스트 확인
kubectl config current-context

# 네임스페이스 목록
kubectl get namespaces
```

## 매니페스트 위치 확인

```bash
# 일반적인 경로
ls kubernetes/ k8s/ helm/ manifests/ deploy/ 2>/dev/null

# YAML 파일 확인
find . -name "*.yaml" -o -name "*.yml" | grep -E "(deploy|service|ingress)"
```

## Staging 배포

### 방법 1: kubectl 직접 배포

```bash
# 네임스페이스 지정
NAMESPACE=staging

# 매니페스트 적용
kubectl apply -f kubernetes/ -n $NAMESPACE

# 또는 특정 파일만
kubectl apply -f kubernetes/deployment.yaml -n $NAMESPACE
```

### 방법 2: Kustomize

```bash
# staging overlay 적용
kubectl apply -k kubernetes/overlays/staging/
```

### 방법 3: Helm

```bash
# Helm 배포
helm upgrade --install {release-name} ./helm \
  --namespace staging \
  --values helm/values-staging.yaml
```

### 배포 상태 확인

```bash
# 배포 상태
kubectl rollout status deployment/{name} -n staging

# Pod 상태
kubectl get pods -n staging -l app={app-name}

# 로그 확인
kubectl logs -f deployment/{name} -n staging
```

## Production 배포

### 방법 1: kubectl 직접 배포

```bash
NAMESPACE=production

# 매니페스트 적용
kubectl apply -f kubernetes/ -n $NAMESPACE

# 롤아웃 상태 확인
kubectl rollout status deployment/{name} -n $NAMESPACE
```

### 방법 2: ArgoCD (GitOps)

```bash
# ArgoCD 앱 동기화
argocd app sync {app-name}

# 상태 확인
argocd app get {app-name}
```

### 방법 3: Helm

```bash
helm upgrade --install {release-name} ./helm \
  --namespace production \
  --values helm/values-production.yaml
```

## 롤백

### kubectl 롤백

```bash
# 롤아웃 히스토리 확인
kubectl rollout history deployment/{name} -n {namespace}

# 이전 버전으로 롤백
kubectl rollout undo deployment/{name} -n {namespace}

# 특정 리비전으로 롤백
kubectl rollout undo deployment/{name} --to-revision={revision} -n {namespace}
```

### Helm 롤백

```bash
# 릴리스 히스토리
helm history {release-name} -n {namespace}

# 롤백
helm rollback {release-name} {revision} -n {namespace}
```

### ArgoCD 롤백

```bash
# 히스토리 확인
argocd app history {app-name}

# 특정 리비전으로 롤백
argocd app rollback {app-name} {revision}
```

## 배포 완료 확인

```bash
# Pod Ready 상태 확인
kubectl get pods -n {namespace} -l app={app-name} -o wide

# 서비스 엔드포인트 확인
kubectl get endpoints -n {namespace}

# Ingress 확인
kubectl get ingress -n {namespace}

# 헬스 체크
kubectl exec -it {pod-name} -n {namespace} -- curl localhost:{port}/health
```

## 트러블슈팅

### Pod 시작 실패

```bash
# Pod 상태 상세
kubectl describe pod {pod-name} -n {namespace}

# 이벤트 확인
kubectl get events -n {namespace} --sort-by='.lastTimestamp'

# 로그 확인
kubectl logs {pod-name} -n {namespace} --previous
```

### 이미지 풀 실패

```bash
# Secret 확인
kubectl get secrets -n {namespace}

# 이미지 풀 시크릿 확인
kubectl describe secret {secret-name} -n {namespace}
```
