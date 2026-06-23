package com.tuitionmanager.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "topic_plans")
public class TopicPlan {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @NotNull
  public LocalDate planDate;

  @ManyToOne
  @NotNull
  public Batch batch;

  @NotBlank
  public String subject;

  @NotBlank
  public String chapter;

  @NotBlank
  public String topic;
}
