# REST API Design

Base path: `/api/v1`

## Authentication

- `POST /auth/login`: returns JWT and user profile.
- `GET /auth/me`: returns current user.

## Students and Parents

- `GET /students?q=&status=`
- `POST /students`
- `GET /students/{id}`
- `PUT /students/{id}`
- `DELETE /students/{id}`
- `GET /parents`
- `POST /parents`

## Batches

- `GET /batches`
- `POST /batches`
- `PUT /batches/{id}`
- `DELETE /batches/{id}`
- `POST /batches/{batchId}/students/{studentId}`

## Fees

- `GET /fees?month=YYYY-MM`
- `POST /fees/payments`
- `GET /fees/pending`

## Attendance

- `GET /attendance?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /attendance`
- `GET /attendance/monthly-summary?month=YYYY-MM`

## Exams and Homework

- `GET /exams`
- `POST /exams`
- `GET /exams/{id}/results`
- `POST /exams/{id}/results`
- `GET /homework`
- `POST /homework`
- `GET /homework/{id}/submissions`
- `POST /homework/{id}/submissions`

## Finance

- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/{id}`
- `DELETE /expenses/{id}`
- `POST /expenses/{id}/receipt`
- `GET /income`
- `POST /income`

## Dashboard, Reports, Notifications

- `GET /dashboard/summary?month=YYYY-MM`
- `GET /reports/{type}.csv`
- `GET /notifications`
- `POST /notifications`

Swagger UI is available at `/swagger-ui.html`.
