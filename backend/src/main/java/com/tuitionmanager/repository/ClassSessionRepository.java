package com.tuitionmanager.repository;

import com.tuitionmanager.domain.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {}
