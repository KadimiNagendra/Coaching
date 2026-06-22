package com.tuitionmanager.web;

import com.tuitionmanager.domain.*;
import com.tuitionmanager.repository.*;
import com.tuitionmanager.service.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class ManagementController {
  private final StudentRepository students;
  private final ParentContactRepository parents;
  private final BatchRepository batches;
  private final FeePaymentRepository fees;
  private final AttendanceRecordRepository attendance;
  private final ExamRepository exams;
  private final ExamResultRepository examResults;
  private final HomeworkRepository homework;
  private final HomeworkSubmissionRepository homeworkSubmissions;
  private final ExpenseRepository expenses;
  private final IncomeEntryRepository income;
  private final NotificationLogRepository notifications;
  private final DashboardService dashboardService;
  private final FileStorageService files;
  private final AuditService audit;
  private final ReportService reports;
  private final ClassSessionRepository classSessions;

  public ManagementController(StudentRepository students, ParentContactRepository parents, BatchRepository batches, FeePaymentRepository fees, AttendanceRecordRepository attendance, ExamRepository exams, ExamResultRepository examResults, HomeworkRepository homework, HomeworkSubmissionRepository homeworkSubmissions, ExpenseRepository expenses, IncomeEntryRepository income, NotificationLogRepository notifications, DashboardService dashboardService, FileStorageService files, AuditService audit, ReportService reports, ClassSessionRepository classSessions) {
    this.students = students;
    this.parents = parents;
    this.batches = batches;
    this.fees = fees;
    this.attendance = attendance;
    this.exams = exams;
    this.examResults = examResults;
    this.homework = homework;
    this.homeworkSubmissions = homeworkSubmissions;
    this.expenses = expenses;
    this.income = income;
    this.notifications = notifications;
    this.dashboardService = dashboardService;
    this.files = files;
    this.audit = audit;
    this.reports = reports;
    this.classSessions = classSessions;
  }

  @GetMapping("/students") public List<Student> students(@RequestParam(required = false) String q, @RequestParam(required = false) StudentStatus status) {
    if (status != null) return students.findByStatus(status);
    if (q != null && !q.isBlank()) return students.findByClassGradeContainingIgnoreCaseOrSubjectsEnrolledContainingIgnoreCaseOrStudentNameContainingIgnoreCase(q, q, q);
    return students.findAll();
  }
  @PostMapping("/students") public Student createStudent(@RequestBody Student student) { if (student.studentId == null || student.studentId.isBlank()) student.studentId = "STU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(); Student saved = students.save(student); audit.record("CREATE", "Student", saved.id, saved.studentName); return saved; }
  @GetMapping("/students/{id}") public Student student(@PathVariable Long id) { return students.findById(id).orElseThrow(); }
  @PutMapping("/students/{id}") public Student updateStudent(@PathVariable Long id, @RequestBody Student input) { input.id = id; Student saved = students.save(input); audit.record("UPDATE", "Student", id, input.studentName); return saved; }
  @DeleteMapping("/students/{id}") public void deleteStudent(@PathVariable Long id) { students.deleteById(id); audit.record("DELETE", "Student", id, "Deleted student"); }

  @GetMapping("/parents") public List<ParentContact> parents() { return parents.findAll(); }
  @PostMapping("/parents") public ParentContact createParent(@RequestBody ParentContact parent) { return parents.save(parent); }

  @GetMapping("/batches") public List<Batch> batches() { return batches.findAll(); }
  @PostMapping("/batches") public Batch createBatch(@RequestBody Batch batch) { Batch saved = batches.save(batch); audit.record("CREATE", "Batch", saved.id, saved.batchName); return saved; }
  @PutMapping("/batches/{id}") public Batch updateBatch(@PathVariable Long id, @RequestBody Batch input) { input.id = id; return batches.save(input); }
  @DeleteMapping("/batches/{id}") public void deleteBatch(@PathVariable Long id) { students.findAll().stream().filter(s -> s.batch != null && id.equals(s.batch.id)).forEach(s -> { s.batch = null; students.save(s); }); homework.findAll().stream().filter(h -> h.batch != null && id.equals(h.batch.id)).forEach(h -> { h.batch = null; homework.save(h); }); batches.deleteById(id); }
  @PostMapping("/batches/{batchId}/students/{studentId}") public Student assignStudent(@PathVariable Long batchId, @PathVariable Long studentId) { Student s = students.findById(studentId).orElseThrow(); s.batch = batches.findById(batchId).orElseThrow(); return students.save(s); }

  @GetMapping("/fees") public List<FeePayment> feePayments(@RequestParam(required = false) String month) { return month == null ? fees.findAll() : fees.findByFeeMonth(month); }
  @PostMapping("/fees/payments") public FeePayment createPayment(@RequestBody FeePayment payment) {
    payment.student = students.findById(payment.student.id).orElseThrow();
    if (payment.paymentId == null || payment.paymentId.isBlank()) payment.paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    if (payment.discountAmount == null) payment.discountAmount = BigDecimal.ZERO;
    if (payment.paidAmount == null) payment.paidAmount = BigDecimal.ZERO;
    if (payment.feeAmount == null || BigDecimal.ZERO.equals(payment.feeAmount)) payment.feeAmount = payment.student.monthlyFee;
    BigDecimal previousPaid = fees.findByStudentIdAndFeeMonth(payment.student.id, payment.feeMonth).stream().map(f -> f.paidAmount == null ? BigDecimal.ZERO : f.paidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal previousDiscount = fees.findByStudentIdAndFeeMonth(payment.student.id, payment.feeMonth).stream().map(f -> f.discountAmount == null ? BigDecimal.ZERO : f.discountAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal due = payment.feeAmount.subtract(previousDiscount).subtract(payment.discountAmount).subtract(previousPaid).subtract(payment.paidAmount);
    payment.dueAmount = due.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : due;
    FeePayment saved = fees.save(payment);
    audit.record("CREATE", "FeePayment", saved.id, saved.paymentId);
    return saved;
  }
  @GetMapping("/fees/pending") public List<FeePayment> pendingFees() { return latestFeeRecords().values().stream().filter(f -> f.dueAmount != null && f.dueAmount.compareTo(BigDecimal.ZERO) > 0).toList(); }

  @GetMapping("/attendance") public List<AttendanceRecord> attendance(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) { return from == null || to == null ? attendance.findAll() : attendance.findByAttendanceDateBetween(from, to); }
  @PostMapping("/attendance") public AttendanceRecord markAttendance(@RequestBody AttendanceRecord record) {
    record.student = students.findById(record.student.id).orElseThrow();
    attendance.findByStudentIdAndAttendanceDate(record.student.id, record.attendanceDate).ifPresent(existing -> record.id = existing.id);
    AttendanceRecord saved = attendance.save(record);
    if (saved.status == AttendanceStatus.ABSENT) createAbsenceNotification(saved);
    return saved;
  }
  @GetMapping("/attendance/monthly-summary") public Map<String, Long> attendanceSummary(@RequestParam String month) { YearMonth ym = YearMonth.parse(month); List<AttendanceRecord> records = attendance.findByAttendanceDateBetween(ym.atDay(1), ym.atEndOfMonth()); return Map.of("present", records.stream().filter(r -> r.status == AttendanceStatus.PRESENT).count(), "late", records.stream().filter(r -> r.status == AttendanceStatus.LATE).count(), "absent", records.stream().filter(r -> r.status == AttendanceStatus.ABSENT).count()); }

  @GetMapping("/exams") public List<Exam> exams() { return exams.findAll(); }
  @PostMapping("/exams") public Exam createExam(@RequestBody Exam exam) { return exams.save(exam); }
  @PutMapping("/exams/{id}") public Exam updateExam(@PathVariable Long id, @RequestBody Exam exam) { exam.id = id; return exams.save(exam); }
  @DeleteMapping("/exams/{id}") public void deleteExam(@PathVariable Long id) { examResults.findByExamId(id).forEach(examResults::delete); exams.deleteById(id); }
  @GetMapping("/exams/{id}/results") public List<ExamResult> results(@PathVariable Long id) { return examResults.findByExamId(id); }
  @PostMapping("/exams/{id}/results") public ExamResult addResult(@PathVariable Long id, @RequestBody ExamResult result) {
    Exam exam = exams.findById(id).orElseThrow();
    if (result.student == null || result.student.id == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student is required");
    Student student = students.findById(result.student.id).orElseThrow();
    if (examResults.findByExamIdAndStudentId(id, student.id).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Result already exists for this student");
    result.exam = exam;
    result.student = student;
    if (result.totalMarks == null) result.totalMarks = exam.totalMarks != null ? exam.totalMarks : 100;
    ExamResult saved = examResults.save(result);
    audit.record("CREATE", "ExamResult", saved.id, student.studentName + " - " + exam.examName);
    return saved;
  }
  @PutMapping("/exams/{examId}/results/{resultId}") public ExamResult updateResult(@PathVariable Long examId, @PathVariable Long resultId, @RequestBody ExamResult input) {
    ExamResult existing = examResults.findById(resultId).orElseThrow();
    if (existing.exam == null || !examId.equals(existing.exam.id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found for this exam");
    if (input.obtainedMarks != null) existing.obtainedMarks = input.obtainedMarks;
    if (input.totalMarks != null) existing.totalMarks = input.totalMarks;
    if (input.remarks != null) existing.remarks = input.remarks;
    ExamResult saved = examResults.save(existing);
    audit.record("UPDATE", "ExamResult", saved.id, existing.student.studentName + " - " + existing.exam.examName);
    return saved;
  }
  @DeleteMapping("/exams/{examId}/results/{resultId}") public void deleteResult(@PathVariable Long examId, @PathVariable Long resultId) {
    ExamResult existing = examResults.findById(resultId).orElseThrow();
    if (existing.exam == null || !examId.equals(existing.exam.id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found for this exam");
    audit.record("DELETE", "ExamResult", resultId, existing.student.studentName + " - " + existing.exam.examName);
    examResults.delete(existing);
  }

  @GetMapping("/homework") public List<Homework> homework() { return homework.findAll(); }
  @PostMapping("/homework") public Homework createHomework(@RequestBody Homework item) {
    if (item.batch != null && item.batch.id != null) {
      item.batch = batches.findById(item.batch.id).orElseThrow();
    }
    return homework.save(item);
  }
  @PutMapping("/homework/{id}") public Homework updateHomework(@PathVariable Long id, @RequestBody Homework item) {
    item.id = id;
    if (item.batch != null && item.batch.id != null) {
      item.batch = batches.findById(item.batch.id).orElseThrow();
    } else {
      item.batch = null;
    }
    return homework.save(item);
  }
  @DeleteMapping("/homework/{id}") public void deleteHomework(@PathVariable Long id) { homeworkSubmissions.findAll().stream().filter(s -> s.homework != null && id.equals(s.homework.id)).forEach(homeworkSubmissions::delete); homework.deleteById(id); }
  @GetMapping("/homework/{id}/submissions") public List<HomeworkSubmission> submissions(@PathVariable Long id) { return homeworkSubmissions.findAll().stream().filter(s -> s.homework != null && id.equals(s.homework.id)).toList(); }
  @PostMapping("/homework/{id}/submissions") public HomeworkSubmission addSubmission(@PathVariable Long id, @RequestBody HomeworkSubmission submission) { submission.homework = homework.findById(id).orElseThrow(); return homeworkSubmissions.save(submission); }

  @GetMapping("/class-sessions") public List<ClassSession> classSessions() { return classSessions.findAll(); }
  @PostMapping("/class-sessions") public ClassSession createClassSession(@RequestBody ClassSession item) {
    if (item.batch != null && item.batch.id != null) {
      item.batch = batches.findById(item.batch.id).orElseThrow();
    }
    return classSessions.save(item);
  }
  @DeleteMapping("/class-sessions/{id}") public void deleteClassSession(@PathVariable Long id) { classSessions.deleteById(id); }

  @GetMapping("/expenses") public List<Expense> expenses() { return expenses.findAll(); }
  @PostMapping("/expenses") public Expense createExpense(@RequestBody Expense expense) { if (expense.expenseId == null || expense.expenseId.isBlank()) expense.expenseId = "EXP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(); return expenses.save(expense); }
  @PutMapping("/expenses/{id}") public Expense updateExpense(@PathVariable Long id, @RequestBody Expense expense) { expense.id = id; return expenses.save(expense); }
  @DeleteMapping("/expenses/{id}") public void deleteExpense(@PathVariable Long id) { expenses.deleteById(id); }
  @PostMapping("/expenses/{id}/receipt") public Expense uploadReceipt(@PathVariable Long id, @RequestParam MultipartFile file) throws IOException { Expense expense = expenses.findById(id).orElseThrow(); expense.receiptImagePath = files.store(file); return expenses.save(expense); }

  @GetMapping("/income") public List<IncomeEntry> income() { return income.findAll(); }
  @PostMapping("/income") public IncomeEntry createIncome(@RequestBody IncomeEntry entry) { if (entry.incomeId == null || entry.incomeId.isBlank()) entry.incomeId = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(); return income.save(entry); }
  @PutMapping("/income/{id}") public IncomeEntry updateIncome(@PathVariable Long id, @RequestBody IncomeEntry entry) { entry.id = id; return income.save(entry); }
  @DeleteMapping("/income/{id}") public void deleteIncome(@PathVariable Long id) { income.deleteById(id); }

  @GetMapping("/notifications") public List<NotificationLog> notifications() { return notifications.findAll(); }
  @PostMapping("/notifications") public NotificationLog createNotification(@RequestBody NotificationLog notification) { return notifications.save(notification); }

  @GetMapping("/dashboard/summary") public Map<String, Object> dashboard(@RequestParam(required = false) String month) { return dashboardService.summary(month == null ? YearMonth.now() : YearMonth.parse(month)); }

  @GetMapping(value = "/reports/{type}.csv", produces = "text/csv")
  public ResponseEntity<String> reportCsv(@PathVariable String type) {
    String csv = reports.csv(type);
    return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + type + ".csv").contentType(MediaType.parseMediaType("text/csv")).body(csv);
  }

  @GetMapping(value = "/reports/{type}.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  public ResponseEntity<byte[]> reportExcel(@PathVariable String type) throws IOException {
    byte[] data = reports.excel(type);
    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + type + "-report.xlsx")
      .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
      .body(data);
  }

  private void createAbsenceNotification(AttendanceRecord record) {
    NotificationLog log = new NotificationLog();
    log.student = record.student;
    log.type = NotificationType.ATTENDANCE_ALERT;
    log.channel = NotificationChannel.WHATSAPP;
    log.recipient = record.student.parent == null ? null : record.student.parent.mobileNumber;
    log.subject = "Attendance alert";
    log.message = record.student.studentName + " was marked absent on " + record.attendanceDate + ".";
    notifications.save(log);
  }

  private Map<String, FeePayment> latestFeeRecords() {
    Map<String, FeePayment> latest = new LinkedHashMap<>();
    fees.findAll().forEach(payment -> {
      String key = payment.student.id + ":" + payment.feeMonth;
      FeePayment current = latest.get(key);
      if (current == null || payment.createdAt.isAfter(current.createdAt)) latest.put(key, payment);
    });
    return latest;
  }
}
