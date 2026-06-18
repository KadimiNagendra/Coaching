package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "exam_results")
public class ExamResult {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(optional = false)
  public Exam exam;

  @ManyToOne(optional = false)
  public Student student;

  public Integer totalMarks = 100;
  public Integer obtainedMarks = 0;
  public BigDecimal percentage = BigDecimal.ZERO;
  public String grade;
  public String remarks;

  @PrePersist @PreUpdate
  void calculate() {
    if (totalMarks != null && totalMarks > 0 && obtainedMarks != null) {
      percentage = BigDecimal.valueOf(obtainedMarks * 100.0 / totalMarks).setScale(2, RoundingMode.HALF_UP);
      grade = percentage.compareTo(BigDecimal.valueOf(90)) >= 0 ? "A+" : percentage.compareTo(BigDecimal.valueOf(75)) >= 0 ? "A" : percentage.compareTo(BigDecimal.valueOf(60)) >= 0 ? "B" : percentage.compareTo(BigDecimal.valueOf(40)) >= 0 ? "C" : "Needs Improvement";
    }
  }
}
