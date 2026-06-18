package com.tuitionmanager.repository;

import com.tuitionmanager.domain.Student;
import com.tuitionmanager.domain.StudentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
  List<Student> findByStatus(StudentStatus status);
  List<Student> findByClassGradeContainingIgnoreCaseOrSubjectsEnrolledContainingIgnoreCaseOrStudentNameContainingIgnoreCase(String classGrade, String subject, String studentName);
}
