package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "exams")
public class Exam {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public String examName;
  public String examType;
  public String subject;
  public String classGrade;
  public LocalDate examDate;
  public Integer totalMarks = 100;
  public String remarks;
}
