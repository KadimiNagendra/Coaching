package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "income_entries")
public class IncomeEntry {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(unique = true, nullable = false)
  public String incomeId;

  public String source;
  public BigDecimal amount = BigDecimal.ZERO;
  public LocalDate incomeDate = LocalDate.now();
  @Column(length = 1000) public String description;
}
