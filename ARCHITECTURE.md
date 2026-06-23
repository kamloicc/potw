# Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Docker Compose Network                        │
│                                                                       │
│  ┌──────────────┐                                                    │
│  │              │         HTTP :80                                   │
│  │    User      ├──────────────────┐                                 │
│  │   Browser    │                  │                                 │
│  │              │                  ▼                                 │
│  └──────────────┘          ┌──────────────┐                          │
│                            │              │                          │
│                            │    NGINX     │                          │
│                            │   Frontend   │                          │
│                            │              │                          │
│                            └──────┬───────┘                          │
│                                   │                                  │
│                                   │ REST API                         │
│                                   │ http://backend:8080              │
│                                   │                                  │
│                                   ▼                                  │
│                            ┌──────────────┐                          │
│                            │              │                          │
│                            │  Spring Boot │                          │
│                            │   Backend    │                          │
│                            │   (Java 21)  │                          │
│                            │              │                          │
│                            └──┬────────┬──┘                          │
│                               │        │                             │
│                 ┌─────────────┘        └──────────────┐              │
│                 │                                     │              │
│                 │ MongoDB                             │ MinIO        │
│                 │ Connection                          │ SDK          │
│                 │ :27017                              │ :9000        │
│                 │                                     │              │
│                 ▼                                     ▼              │
│          ┌──────────────┐                     ┌──────────────┐      │
│          │              │                     │              │      │
│          │   MongoDB    │                     │    MinIO     │      │
│          │              │                     │              │      │
│          │  Database    │                     │   Object     │      │
│          │              │                     │   Storage    │      │
│          │  posts/      │                     │              │      │
│          │  metadata    │                     │  videos/     │      │
│          │              │                     │  thumbnails  │      │
│          │              │                     │              │      │
│          └──────────────┘                     └──────────────┘      │
│                 │                                     │              │
│                 │                                     │              │
│          ┌──────▼──────┐                     ┌────────▼──────┐      │
│          │  Persistent │                     │   Persistent  │      │
│          │   Volume    │                     │    Volume     │      │
│          │   (10GB)    │                     │    (50GB)     │      │
│          └─────────────┘                     └───────────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Communication

### Frontend → Backend
- Protocol: HTTP/REST
- Port: 8080
- Authentication: HTTP Basic Auth (Admin endpoints only)

### Backend → MongoDB
- Protocol: MongoDB Wire Protocol
- Port: 27017
- Database: playeroftheweek

### Backend → MinIO
- Protocol: S3-compatible API
- Port: 9000
- Bucket: player-videos

### User → Frontend
- Protocol: HTTP
- Port: 80
- NGINX serves static files and proxies API calls

## Data Flow

### Create Post Flow
```
User → Admin Panel → Backend API → MongoDB (metadata) + MinIO (video/thumbnail)
```

### View Post Flow
```
User → Frontend → Backend API → MongoDB (fetch metadata) → MinIO (presigned URL) → User (video stream)
```

## Deployment

### Docker Compose
All services run in a single Docker network with internal DNS resolution.

### Kubernetes
Each component deployed as separate workload with persistent volumes and ingress routing.
