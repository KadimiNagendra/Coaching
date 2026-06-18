package com.tuitionmanager.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "users")
public class UserAccount {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Email @NotBlank @Column(unique = true, nullable = false)
  public String email;

  @NotBlank @Column(nullable = false)
  public String passwordHash;

  @NotBlank @Column(nullable = false)
  public String fullName;

  @Enumerated(EnumType.STRING) @Column(nullable = false)
  public Role role = Role.TEACHER;

  public boolean enabled = true;
  public Instant createdAt = Instant.now();
}
