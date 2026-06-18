package com.tuitionmanager.repository;

import com.tuitionmanager.domain.HomeworkSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, Long> {}
