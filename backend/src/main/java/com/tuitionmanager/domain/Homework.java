package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "homework")
public class Homework {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public String title;
  public String subject;
  @Column(length = 3000) public String description;
  public LocalDate assignedDate = LocalDate.now();
  public LocalDate dueDate;
  @ManyToOne public Batch batch;
  public String classGrade;
  public String remarks;
}
