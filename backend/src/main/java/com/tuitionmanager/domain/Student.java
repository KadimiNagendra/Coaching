package com.tuitionmanager.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "students")
public class Student {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(unique = true, nullable = false)
  public String studentId;

  @NotBlank public String studentName;
  public LocalDate dateOfBirth;
  @Enumerated(EnumType.STRING) public Gender gender;
  @NotBlank public String classGrade;
  public String schoolName;
  public String subjectsEnrolled;
  public LocalDate joiningDate = LocalDate.now();
  public BigDecimal monthlyFee = BigDecimal.ZERO;
  @Enumerated(EnumType.STRING) public StudentStatus status = StudentStatus.ACTIVE;

  @ManyToOne(cascade = CascadeType.ALL)
  public ParentContact parent;

  public String initialStudentUsername;
  public String initialStudentPassword;
  public String initialParentUsername;
  public String initialParentPassword;

  @ManyToOne
  public Batch batch;

  public Instant createdAt = Instant.now();
  public Instant updatedAt = Instant.now();
}
