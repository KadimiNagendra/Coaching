package com.tuitionmanager.repository;

import com.tuitionmanager.domain.IncomeEntry;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeEntryRepository extends JpaRepository<IncomeEntry, Long> {
  List<IncomeEntry> findByIncomeDateBetween(LocalDate start, LocalDate end);
}
