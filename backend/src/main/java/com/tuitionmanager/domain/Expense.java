package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(unique = true, nullable = false)
  public String expenseId;

  public LocalDate expenseDate = LocalDate.now();
  @Enumerated(EnumType.STRING) public ExpenseCategory expenseCategory = ExpenseCategory.MISCELLANEOUS;
  public BigDecimal amount = BigDecimal.ZERO;
  public String vendorName;
  @Column(length = 1000) public String description;
  public String paymentMethod;
  public String receiptImagePath;
}
