package com.tuitionmanager.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalTime;

@Entity
@Table(name = "batches")
public class Batch {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @NotBlank public String batchName;
  @NotBlank public String subject;
  @NotBlank public String classGrade;
  public LocalTime startTime;
  public LocalTime endTime;
  public String daysOfWeek;
  public Integer maximumStudents = 25;
}
