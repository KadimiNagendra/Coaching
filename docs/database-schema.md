# Database Schema

The MVP uses JPA/Hibernate with PostgreSQL. In development the schema is generated with `spring.jpa.hibernate.ddl-auto=update`; for production, move these tables into versioned migrations such as Flyway or Liquibase.

## Core Tables

### users

- `id` bigint primary key
- `email` unique, required
- `password_hash` required
- `full_name` required
- `role`: `TEACHER`, `PARENT`, `STUDENT`
- `enabled`
- `created_at`

### parents

- `id`
- `name`
- `mobile_number`
- `email`
- `address`
- `created_at`

### students

- `id`
- `student_id` unique
- `student_name`
- `date_of_birth`
- `gender`
- `class_grade`
- `school_name`
- `subjects_enrolled`
- `joining_date`
- `monthly_fee`
- `status`: `ACTIVE`, `INACTIVE`
- `parent_id`
- `batch_id`
- `created_at`, `updated_at`

### batches

- `id`
- `batch_name`
- `subject`
- `class_grade`
- `start_time`
- `end_time`
- `days_of_week`
- `maximum_students`

### fee_payments

- `id`
- `payment_id` unique
- `student_id`
- `fee_month`
- `fee_amount`
- `discount_amount`
- `paid_amount`
- `due_amount`
- `payment_date`
- `payment_mode`
- `transaction_reference`
- `remarks`
- `created_at`

### attendance_records

- `id`
- `student_id`
- `attendance_date`
- `status`: `PRESENT`, `ABSENT`, `LATE`
- `remarks`

### exams and exam_results

`exams` stores test metadata. `exam_results` stores student marks, calculated percentage, grade, and remarks.

### homework and homework_submissions

`homework` stores assignments. `homework_submissions` tracks completion status, submitted date, feedback, and remarks per student.

### expenses

- `id`
- `expense_id` unique
- `expense_date`
- `expense_category`
- `amount`
- `vendor_name`
- `description`
- `payment_method`
- `receipt_image_path`

### income_entries

- `id`
- `income_id` unique
- `source`
- `amount`
- `income_date`
- `description`

### notifications

Stores WhatsApp, SMS, email, and in-app notification requests as a provider-neutral queue/log.

### audit_logs

Tracks important create, update, and delete actions.
