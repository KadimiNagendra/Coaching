# Tuition Teacher Management & Expense Tracking System

A modern full-stack MVP for an individual tuition teacher managing after-school classes, students, fee collections, attendance, exams, homework, expenses, income, reports, and parent communication from one responsive dashboard.

## Stack

- Frontend: React, TypeScript, Vite, Material UI, TanStack Query, Recharts
- Backend: Spring Boot 3, Java 17, Spring Security, JWT, JPA/Hibernate
- Database: PostgreSQL
- Infrastructure: Docker Compose
- Docs/API: Swagger/OpenAPI

## Quick Start

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

Seed login:

- Email: `teacher@example.com`
- Password: `Admin@123`

## Local Development

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the backend.
