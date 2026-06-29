package com.tuitionmanager.service;

import com.tuitionmanager.auth.AccountLookup;
import com.tuitionmanager.domain.*;
import com.tuitionmanager.repository.*;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.tuitionmanager.web.AuthController.ResetCredentialsRequest;

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
  private final PasswordEncoder passwordEncoder;
  private final ClarityHomeDataRepository clarityHomeDataRepository;
  private final AccountLookup accountLookup;

  public PortalService(UserAccountRepository users, StudentRepository students, FeePaymentRepository fees, AttendanceRecordRepository attendance, ExamRepository exams, ExamResultRepository examResults, HomeworkRepository homework, NotificationLogRepository notifications, PasswordEncoder passwordEncoder, ClarityHomeDataRepository clarityHomeDataRepository, AccountLookup accountLookup) {
    this.users = users;
    this.students = students;
    this.fees = fees;
    this.attendance = attendance;
    this.exams = exams;
    this.examResults = examResults;
    this.homework = homework;
    this.notifications = notifications;
    this.passwordEncoder = passwordEncoder;
    this.clarityHomeDataRepository = clarityHomeDataRepository;
    this.accountLookup = accountLookup;
  }

  public Map<String, Object> overview() {
    UserAccount user = currentUser();
    List<Student> linkedStudents = (user.role == Role.FAMILY_MEMBER) ? List.of() : linkedStudents(user);
    return Map.of(
      "role", user.role.name(),
      "fullName", user.fullName,
      "email", user.email,
      "students", linkedStudents
    );
  }

  public void resetCredentials(ResetCredentialsRequest request) {
    UserAccount user = currentUser();
    accountLookup.findByUsername(request.newUsername()).ifPresent(existing -> {
      if (!existing.id.equals(user.id)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
      }
    });
    String oldUsername = user.email;
    user.email = request.newUsername();
    user.passwordHash = passwordEncoder.encode(request.newPassword());
    users.save(user);

    // Sync credentials to Student records so teachers can view the updated logins
    if (user.role == Role.STUDENT && user.linkedStudentId != null) {
      students.findById(user.linkedStudentId).ifPresent(student -> {
        student.initialStudentUsername = request.newUsername();
        student.initialStudentPassword = request.newPassword();
        students.save(student);
      });
    } else if (user.role == Role.PARENT && user.linkedParentId != null) {
      List<Student> children = students.findByParentId(user.linkedParentId);
      for (Student student : children) {
        student.initialParentUsername = request.newUsername();
        student.initialParentPassword = request.newPassword();
        students.save(student);
      }
    } else if (user.role == Role.FAMILY_MEMBER && user.linkedAdminEmail != null) {
      clarityHomeDataRepository.findById(user.linkedAdminEmail).ifPresent(data -> {
        try {
          com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
          Map<String, Object> payload = mapper.readValue(data.jsonData, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
          Object membersObj = payload.get("ch_family_members");
          if (membersObj instanceof List) {
            List<Map<String, Object>> members = (List<Map<String, Object>>) membersObj;
            boolean updated = false;
            for (Map<String, Object> member : members) {
              String username = (String) member.get("username");
              if (username != null && username.equalsIgnoreCase(oldUsername)) {
                member.put("username", request.newUsername());
                member.put("password", request.newPassword());
                updated = true;
              }
            }
            if (updated) {
              data.jsonData = mapper.writeValueAsString(payload);
              clarityHomeDataRepository.save(data);
            }
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
      });
    }
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
    UserAccount user = currentUser();
    List<Student> studentsList = linkedStudents(user);
    List<String> grades = studentsList.stream().map(s -> s.classGrade).filter(g -> g != null && !g.isBlank()).distinct().toList();
    List<Long> batchIds = studentsList.stream().map(s -> s.batch).filter(b -> b != null).map(b -> b.id).distinct().toList();
    return homework.findAll().stream()
      .filter(h -> (h.classGrade != null && grades.contains(h.classGrade)) || (h.batch != null && batchIds.contains(h.batch.id)))
      .toList();
  }

  public List<NotificationLog> notifications() {
    return notifications.findAll().stream()
      .filter(log -> log.student != null && studentIds(currentUser()).contains(log.student.id))
      .toList();
  }

  private UserAccount currentUser() {
    return accountLookup.requireUser(SecurityContextHolder.getContext().getAuthentication());
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
