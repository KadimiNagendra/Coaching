package com.tuitionmanager.repository;

import com.tuitionmanager.domain.Homework;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeworkRepository extends JpaRepository<Homework, Long> {}
