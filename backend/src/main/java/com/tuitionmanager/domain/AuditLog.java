package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public String actor;
  public String action;
  public String entityType;
  public Long entityId;
  public Instant createdAt = Instant.now();
  @Column(length = 2000) public String details;
}
