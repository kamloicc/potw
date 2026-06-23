# Player of the Week

Football blog platform for showcasing weekly player highlights with video content.

## Technical Stack

### Backend
- Java 21
- Spring Boot 3.2.0
- Spring Security (HTTP Basic Auth)
- Spring Data MongoDB
- MinIO Java SDK 8.5.7
- Lombok
- Maven

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- NGINX

### Infrastructure
- MongoDB 7.0 (Database)
- MinIO (Object Storage)
- Docker & Docker Compose
- Kubernetes
- NGINX Ingress Controller

## Architecture

```
Frontend (NGINX) → Backend (Spring Boot) → MongoDB
                                        → MinIO
```

## Prerequisites

- Docker & Docker Compose
- Java 21 (for local development)
- Maven (for local development)
- kubectl (for Kubernetes deployment)

## Running with Docker Compose

```bash
cd player-of-the-week
docker-compose up --build
```

Access at: http://localhost

## Running Locally

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
# Serve with any static file server
python3 -m http.server 8000
```

## Kubernetes Deployment

```bash
cd k8s

kubectl apply -f mongodb-deployment.yaml
kubectl apply -f minio-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
```

## Configuration

### Environment Variables

Backend:
- `MONGODB_URI` - MongoDB connection string
- `MINIO_URL` - MinIO endpoint
- `MINIO_PUBLIC_URL` - Public MinIO URL (for proxied access)
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET` - MinIO bucket name
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password

### Default Credentials

Admin: `admin` / `admin123`

**Change these in production**

## API Endpoints

### Public
- `GET /api/posts/latest` - Latest post
- `GET /api/posts` - All posts
- `GET /api/posts/{slug}` - Post by slug
- `GET /api/posts/previous/{id}` - Previous post
- `GET /api/posts/next/{id}` - Next post
- `GET /api/posts/search?query={query}` - Search posts

### Admin (requires authentication)
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/{id}` - Update post
- `DELETE /api/admin/posts/{id}` - Delete post
- `POST /api/admin/upload-video` - Upload video
- `POST /api/admin/upload-thumbnail` - Upload thumbnail

## Features

- Weekly player highlight posts
- Video uploads with thumbnail support
- Archive view with search
- Admin panel for content management
- Responsive design
- Navigation between posts
- Tag-based organization
- MinIO object storage for videos
- MongoDB for metadata storage
- Kubernetes-ready deployment
