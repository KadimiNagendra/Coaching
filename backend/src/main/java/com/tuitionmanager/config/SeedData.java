package com.tuitionmanager.config;

import com.tuitionmanager.domain.*;
import com.tuitionmanager.repository.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedData {
  @Bean
  CommandLineRunner seed(UserAccountRepository users, BatchRepository batches, StudentRepository students, FeePaymentRepository fees, AttendanceRecordRepository attendance, ExamRepository exams, ExamResultRepository results, HomeworkRepository homework, ExpenseRepository expenses, IncomeEntryRepository income, NotificationLogRepository notifications, PasswordEncoder encoder) {
    return args -> {
      if (users.count() == 0) {
        UserAccount teacher = new UserAccount();
        teacher.email = "teacher@example.com";
        teacher.fullName = "Tuition Teacher";
        teacher.passwordHash = encoder.encode("Admin@123");
        teacher.role = Role.TEACHER;
        users.save(teacher);
      }
      if (students.count() > 0) return;

      Batch math6 = new Batch(); math6.batchName = "Class 6 Mathematics"; math6.subject = "Mathematics"; math6.classGrade = "Class 6"; math6.startTime = LocalTime.of(17, 0); math6.endTime = LocalTime.of(18, 0); math6.daysOfWeek = "MON,WED,FRI"; math6.maximumStudents = 30; batches.save(math6);
      Batch sci8 = new Batch(); sci8.batchName = "Class 8 Science"; sci8.subject = "Science"; sci8.classGrade = "Class 8"; sci8.startTime = LocalTime.of(18, 0); sci8.endTime = LocalTime.of(19, 0); sci8.daysOfWeek = "TUE,THU,SAT"; batches.save(sci8);
      Batch math10 = new Batch(); math10.batchName = "Class 10 Mathematics"; math10.subject = "Mathematics"; math10.classGrade = "Class 10"; math10.startTime = LocalTime.of(19, 0); math10.endTime = LocalTime.of(20, 0); math10.daysOfWeek = "MON,WED,FRI"; batches.save(math10);

      ParentContact p1 = parent("Anita Sharma", "9876543210", "anita@example.com", "MG Road");
      Student s1 = student("STU-1001", "Aarav Sharma", "Class 6", "Mathematics", math6, p1, BigDecimal.valueOf(2500)); students.save(s1);
      Student s2 = student("STU-1002", "Meera Reddy", "Class 8", "Science", sci8, parent("Ravi Reddy", "9876543211", "ravi@example.com", "Lake View"), BigDecimal.valueOf(3000)); students.save(s2);
      Student s3 = student("STU-1003", "Kabir Singh", "Class 10", "Mathematics", math10, parent("Neha Singh", "9876543212", "neha@example.com", "Park Street"), BigDecimal.valueOf(4000)); students.save(s3);

      fees.save(payment("PAY-1001", s1, "2026-06", 2500, 2500, 0));
      fees.save(payment("PAY-1002", s2, "2026-06", 3000, 1500, 1500));
      fees.save(payment("PAY-1003", s3, "2026-06", 4000, 4000, 0));

      attendance.save(att(s1, AttendanceStatus.PRESENT));
      attendance.save(att(s2, AttendanceStatus.ABSENT));
      attendance.save(att(s3, AttendanceStatus.LATE));

      Exam exam = new Exam(); exam.examName = "June Unit Test"; exam.subject = "Mathematics"; exam.classGrade = "Class 10"; exam.examDate = LocalDate.now().plusDays(5); exam.totalMarks = 100; exams.save(exam);
      ExamResult result = new ExamResult(); result.exam = exam; result.student = s3; result.totalMarks = 100; result.obtainedMarks = 86; results.save(result);

      Homework hw = new Homework(); hw.title = "Algebra Practice"; hw.subject = "Mathematics"; hw.batch = math10; hw.description = "Complete exercise 4.1 and 4.2."; hw.dueDate = LocalDate.now().plusDays(2); homework.save(hw);

      Expense rent = new Expense(); rent.expenseId = "EXP-1001"; rent.expenseCategory = ExpenseCategory.ROOM_RENT; rent.amount = BigDecimal.valueOf(8000); rent.vendorName = "Classroom Owner"; rent.paymentMethod = "UPI"; expenses.save(rent);
      IncomeEntry admission = new IncomeEntry(); admission.incomeId = "INC-1001"; admission.source = "Admission Fees"; admission.amount = BigDecimal.valueOf(2000); admission.description = "New student admission"; income.save(admission);

      NotificationLog notification = new NotificationLog(); notification.type = NotificationType.FEE_DUE_REMINDER; notification.channel = NotificationChannel.WHATSAPP; notification.student = s2; notification.recipient = s2.parent.mobileNumber; notification.subject = "Fee reminder"; notification.message = "June fee balance is pending."; notifications.save(notification);
    };
  }

  private ParentContact parent(String name, String mobile, String email, String address) { ParentContact p = new ParentContact(); p.name = name; p.mobileNumber = mobile; p.email = email; p.address = address; return p; }
  private Student student(String id, String name, String grade, String subjects, Batch batch, ParentContact parent, BigDecimal fee) { Student s = new Student(); s.studentId = id; s.studentName = name; s.classGrade = grade; s.schoolName = "City Public School"; s.subjectsEnrolled = subjects; s.batch = batch; s.parent = parent; s.monthlyFee = fee; s.gender = Gender.OTHER; return s; }
  private FeePayment payment(String id, Student student, String month, int fee, int paid, int due) { FeePayment p = new FeePayment(); p.paymentId = id; p.student = student; p.feeMonth = month; p.feeAmount = BigDecimal.valueOf(fee); p.paidAmount = BigDecimal.valueOf(paid); p.dueAmount = BigDecimal.valueOf(due); p.paymentMode = PaymentMode.UPI; return p; }
  private AttendanceRecord att(Student student, AttendanceStatus status) { AttendanceRecord a = new AttendanceRecord(); a.student = student; a.status = status; a.attendanceDate = LocalDate.now(); return a; }
}
