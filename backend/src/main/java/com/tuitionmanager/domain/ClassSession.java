package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "class_sessions")
public class ClassSession {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public LocalDate sessionDate = LocalDate.now();

  @ManyToOne public Batch batch;

  public String subject;
  public String classGrade;

  @Column(length = 1000) public String topicsCovered;
  public String remarks;
}
