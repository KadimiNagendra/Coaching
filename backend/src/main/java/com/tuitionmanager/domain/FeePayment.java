package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "fee_payments")
public class FeePayment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(unique = true, nullable = false)
  public String paymentId;

  @ManyToOne(optional = false)
  public Student student;

  @Column(nullable = false)
  public String feeMonth;

  public BigDecimal feeAmount = BigDecimal.ZERO;
  public BigDecimal discountAmount = BigDecimal.ZERO;
  public BigDecimal paidAmount = BigDecimal.ZERO;
  public BigDecimal dueAmount = BigDecimal.ZERO;
  public LocalDate paymentDate = LocalDate.now();
  @Enumerated(EnumType.STRING) public PaymentMode paymentMode = PaymentMode.CASH;
  public String transactionReference;
  @Column(length = 1000) public String remarks;
  public Instant createdAt = Instant.now();
}
