package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "class_sessions")
public class ClassSession {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public LocalDate sessionDate = LocalDate.now();

  @ManyToOne public Batch batch;

  public String subject;
  public String classGrade;

  public String chapter;
  public String topic;



  @Column(length = 1000) public String topicsCovered;
  public String remarks;
}

