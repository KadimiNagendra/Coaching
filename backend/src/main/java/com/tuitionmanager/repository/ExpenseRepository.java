package com.tuitionmanager.repository;

import com.tuitionmanager.domain.Expense;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
  List<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end);
}
