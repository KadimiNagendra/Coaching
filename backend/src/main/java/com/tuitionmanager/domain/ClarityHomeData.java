package com.tuitionmanager.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "clarity_home_data")
public class ClarityHomeData {
  @Id
  public String email;

  @Column(columnDefinition = "TEXT")
  public String jsonData;
}
