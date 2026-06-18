# Deployment Guide

## Docker Compose

```bash
docker compose up --build -d
```

Services:

- `postgres`: PostgreSQL 16
- `backend`: Spring Boot API on port 8080
- `frontend`: Nginx-served React app on port 3000

## Environment Variables

Backend:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MINUTES`
- `UPLOAD_DIR`
- `CORS_ORIGINS`

## Cloud Ready Path

1. Build frontend and backend images in CI.
2. Push images to a registry.
3. Run PostgreSQL as a managed database.
4. Store receipts in S3, Azure Blob Storage, or GCS.
5. Move secrets to a secret manager.
6. Terminate HTTPS at the load balancer or ingress.
7. Add backups, monitoring, and alerting.
8. Replace Hibernate auto-DDL with Flyway/Liquibase migrations.

## Pre-Launch Checklist

- Change seed password after first login.
- Replace default JWT secret.
- Configure production CORS origins.
- Enable HTTPS.
- Add real notification provider credentials.
- Configure database backups.
