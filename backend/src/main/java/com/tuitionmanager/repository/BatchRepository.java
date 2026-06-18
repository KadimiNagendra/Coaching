package com.tuitionmanager.repository;

import com.tuitionmanager.domain.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {}
