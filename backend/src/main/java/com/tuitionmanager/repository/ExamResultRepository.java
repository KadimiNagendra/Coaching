package com.tuitionmanager.repository;

import com.tuitionmanager.domain.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {}
