package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "homework_submissions")
public class HomeworkSubmission {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(optional = false) public Homework homework;
  @ManyToOne(optional = false) public Student student;
  @Enumerated(EnumType.STRING) public CompletionStatus completionStatus = CompletionStatus.PENDING;
  public LocalDate submittedDate;
  @Column(length = 1000) public String feedback;
  public String remarks;
}
