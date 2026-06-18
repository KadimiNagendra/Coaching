package com.tuitionmanager.repository;

import com.tuitionmanager.domain.ExamResult;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
  List<ExamResult> findByExamId(Long examId);
  List<ExamResult> findByStudentIdIn(List<Long> studentIds);
  Optional<ExamResult> findByExamIdAndStudentId(Long examId, Long studentId);
}
