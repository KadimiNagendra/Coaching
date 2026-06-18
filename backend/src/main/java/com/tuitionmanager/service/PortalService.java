package com.tuitionmanager.service;

import com.tuitionmanager.domain.*;
import com.tuitionmanager.repository.*;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PortalService {
  private final UserAccountRepository users;
  private final StudentRepository students;
  private final FeePaymentRepository fees;
  private final AttendanceRecordRepository attendance;
  private final ExamRepository exams;
  private final ExamResultRepository examResults;
  private final HomeworkRepository homework;
  private final NotificationLogRepository notifications;

  public PortalService(UserAccountRepository users, StudentRepository students, FeePaymentRepository fees, AttendanceRecordRepository attendance, ExamRepository exams, ExamResultRepository examResults, HomeworkRepository homework, NotificationLogRepository notifications) {
    this.users = users;
    this.students = students;
    this.fees = fees;
    this.attendance = attendance;
    this.exams = exams;
    this.examResults = examResults;
    this.homework = homework;
    this.notifications = notifications;
  }

  public Map<String, Object> overview() {
    UserAccount user = currentUser();
    List<Student> linkedStudents = linkedStudents(user);
    return Map.of(
      "role", user.role.name(),
      "fullName", user.fullName,
      "email", user.email,
      "students", linkedStudents
    );
  }

  public List<FeePayment> fees() {
    return fees.findAll().stream().filter(payment -> payment.student != null && studentIds(currentUser()).contains(payment.student.id)).toList();
  }

  public List<AttendanceRecord> attendance() {
    return attendance.findAll().stream().filter(record -> record.student != null && studentIds(currentUser()).contains(record.student.id)).toList();
  }

  public List<Exam> exams() {
    UserAccount user = currentUser();
    List<String> grades = linkedStudents(user).stream().map(s -> s.classGrade).distinct().toList();
    return exams.findAll().stream().filter(exam -> grades.contains(exam.classGrade)).toList();
  }

  public List<ExamResult> results() {
    List<Long> ids = studentIds(currentUser());
    if (ids.isEmpty()) return List.of();
    return examResults.findByStudentIdIn(ids);
  }

  public List<Homework> homework() {
    return homework.findAll();
  }

  public List<NotificationLog> notifications() {
    return notifications.findAll().stream()
      .filter(log -> log.student != null && studentIds(currentUser()).contains(log.student.id))
      .toList();
  }

  private UserAccount currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getName() == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }
    return users.findByEmail(authentication.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }

  private List<Long> studentIds(UserAccount user) {
    return linkedStudents(user).stream().map(student -> student.id).toList();
  }

  private List<Student> linkedStudents(UserAccount user) {
    if (user.role == Role.STUDENT) {
      if (user.linkedStudentId == null) throw forbidden("Student account is not linked to a profile");
      return List.of(students.findById(user.linkedStudentId).orElseThrow(() -> forbidden("Student profile not found")));
    }
    if (user.role == Role.PARENT) {
      if (user.linkedParentId == null) throw forbidden("Parent account is not linked to a profile");
      List<Student> children = students.findByParentId(user.linkedParentId);
      if (children.isEmpty()) throw forbidden("No students linked to this parent account");
      return children;
    }
    throw forbidden("Portal access is only for parent and student accounts");
  }

  private ResponseStatusException forbidden(String message) {
    return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
  }
}
