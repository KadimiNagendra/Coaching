package com.tuitionmanager.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "parents")
public class ParentContact {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @NotBlank public String name;
  @NotBlank public String mobileNumber;
  public String email;
  @Column(length = 1000) public String address;
  public Instant createdAt = Instant.now();
}
