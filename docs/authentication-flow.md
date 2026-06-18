# Authentication Flow

```mermaid
sequenceDiagram
  participant Teacher
  participant Frontend
  participant Backend
  participant Database

  Teacher->>Frontend: Enter email and password
  Frontend->>Backend: POST /api/v1/auth/login
  Backend->>Database: Find user by email
  Database-->>Backend: User with BCrypt password hash
  Backend->>Backend: Verify password
  Backend-->>Frontend: JWT and profile
  Frontend->>Frontend: Store token in localStorage
  Frontend->>Backend: API request with Authorization header
  Backend->>Backend: Validate JWT signature and expiry
  Backend-->>Frontend: Protected resource
```

## Roles

- `TEACHER`: full access in MVP.
- `PARENT`: reserved for future portal.
- `STUDENT`: reserved for future portal.

## Security Checklist

- Use HTTPS in production.
- Rotate `JWT_SECRET` through a secret manager.
- Keep JWT expiry reasonably short.
- Use refresh tokens only if persistent sessions are needed.
- Add account lockout and password reset before public launch.
