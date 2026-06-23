# Deployment Guide

## Quick Start Options

### Option 1: Docker Compose (Recommended for Testing)

```bash
# Start all services
docker-compose up --build

# Access application at http://localhost
```

### Option 2: Kubernetes (Production)

Follow the steps below for a complete production deployment.

---

## Kubernetes Production Deployment

### 1. Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- NGINX Ingress Controller
- Docker for building images

### 2. Install NGINX Ingress Controller (if not installed)

```bash
# For minikube
minikube addons enable ingress

# For standard Kubernetes
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### 3. Build and Push Docker Images

```bash
# Build backend
cd backend
docker build -t player-of-the-week-backend:latest .

# Build frontend
cd ../frontend
docker build -t player-of-the-week-frontend:latest .

# If using a registry, tag and push
docker tag player-of-the-week-backend:latest <registry>/player-of-the-week-backend:latest
docker push <registry>/player-of-the-week-backend:latest

docker tag player-of-the-week-frontend:latest <registry>/player-of-the-week-frontend:latest
docker push <registry>/player-of-the-week-frontend:latest
```

### 4. Update Kubernetes Manifests

If using a container registry, update image references in:
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`

Change:
```yaml
image: player-of-the-week-backend:latest
```
To:
```yaml
image: <your-registry>/player-of-the-week-backend:latest
```

### 5. Deploy to Kubernetes

```bash
cd k8s

# Create namespace (optional)
kubectl create namespace player-of-the-week
kubectl config set-context --current --namespace=player-of-the-week

# Deploy MongoDB
kubectl apply -f mongodb-deployment.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s

# Deploy MinIO
kubectl apply -f minio-deployment.yaml

# Wait for MinIO to be ready
kubectl wait --for=condition=ready pod -l app=minio --timeout=300s

# Deploy Backend
kubectl apply -f backend-deployment.yaml

# Wait for Backend to be ready
kubectl wait --for=condition=ready pod -l app=backend --timeout=300s

# Deploy Frontend
kubectl apply -f frontend-deployment.yaml

# Deploy Ingress
kubectl apply -f ingress.yaml
```

### 6. Configure DNS/Hosts

**For Local Testing:**

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
<INGRESS_IP> playeroftheweek.local
```

Get ingress IP:
```bash
kubectl get ingress player-of-the-week-ingress
```

**For Production:**

Configure your DNS provider to point your domain to the ingress load balancer IP.

### 7. Access the Application

- Frontend: http://playeroftheweek.local (or your domain)
- Backend API: http://playeroftheweek.local/api
- Admin Panel: http://playeroftheweek.local/admin.html

### 8. Update Admin Credentials

**IMPORTANT**: Change default credentials before production use!

```bash
# Update the secret
kubectl delete secret admin-secret
kubectl create secret generic admin-secret \
  --from-literal=username=<your-username> \
  --from-literal=password=<your-strong-password>

# Restart backend pods
kubectl rollout restart deployment backend
```

---

## Monitoring & Operations

### Check Deployment Status

```bash
# All resources
kubectl get all

# Pods
kubectl get pods

# Services
kubectl get services

# Ingress
kubectl get ingress

# Persistent Volume Claims
kubectl get pvc
```

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend

# Frontend logs
kubectl logs -f deployment/frontend

# MongoDB logs
kubectl logs -f deployment/mongodb

# MinIO logs
kubectl logs -f deployment/minio
```

### Scale Services

```bash
# Scale backend
kubectl scale deployment backend --replicas=3

# Scale frontend
kubectl scale deployment frontend --replicas=3
```

### Update Application

```bash
# After building new images
kubectl rollout restart deployment backend
kubectl rollout restart deployment frontend

# Check rollout status
kubectl rollout status deployment backend
kubectl rollout status deployment frontend
```

---

## Production Considerations

### 1. Secrets Management

Use Kubernetes Secrets or external secret management (Vault, AWS Secrets Manager):

```bash
# Create from file
kubectl create secret generic admin-secret --from-file=./secrets/

# Or use external secrets operator
kubectl apply -f external-secrets.yaml
```

### 2. SSL/TLS

Update ingress for HTTPS:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: player-of-the-week-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - playeroftheweek.com
    secretName: playeroftheweek-tls
  rules:
  - host: playeroftheweek.com
    # ... rest of config
```

### 3. MongoDB Replica Set

For production, use MongoDB replica set or managed service (MongoDB Atlas).

### 4. MinIO High Availability

Deploy MinIO in distributed mode with multiple nodes.

### 5. Resource Limits

Adjust resource requests/limits based on your workload:

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "1000m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

### 6. Backup Strategy

```bash
# MongoDB backup
kubectl exec -it <mongodb-pod> -- mongodump --out /backup

# MinIO backup
mc mirror minio-service/player-videos /backup/videos
```

### 7. Monitoring

Install Prometheus & Grafana:

```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
kubectl logs deployment/backend

# Common issues:
# - MongoDB connection: verify MONGODB_URI
# - MinIO connection: verify MINIO_URL
# - Image pull: check image name and registry
```

### Video Upload Fails

```bash
# Check MinIO is running
kubectl get pods -l app=minio

# Check MinIO logs
kubectl logs deployment/minio

# Verify bucket creation
kubectl exec -it <minio-pod> -- mc ls local/
```

### Frontend Can't Reach Backend

```bash
# Check ingress
kubectl describe ingress player-of-the-week-ingress

# Check services
kubectl get svc backend-service frontend-service

# Test backend directly
kubectl port-forward svc/backend-service 8080:8080
curl http://localhost:8080/api/posts/latest
```

### Persistent Volume Issues

```bash
# Check PVCs
kubectl get pvc

# Check PVs
kubectl get pv

# Describe for details
kubectl describe pvc mongodb-pvc
```

---

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Delete namespace (if used)
kubectl delete namespace player-of-the-week

# For Docker Compose
docker-compose down -v
```

---

## Performance Tuning

### 1. Enable Caching

Backend already has caching configured. Adjust in `application.yml`:

```yaml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=100,expireAfterWrite=10m
```

### 2. Database Indexing

Indexes are automatically created. Monitor with:

```bash
kubectl exec -it <mongodb-pod> -- mongo
> use playeroftheweek
> db.posts.getIndexes()
```

### 3. Connection Pooling

Adjust MongoDB connection pool:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://mongodb-service:27017/playeroftheweek?maxPoolSize=50
```

---

## Support

For issues or questions:
1. Check logs: `kubectl logs`
2. Check pod status: `kubectl get pods`
3. Describe resources: `kubectl describe <resource>`
4. Review configuration in deployment files
