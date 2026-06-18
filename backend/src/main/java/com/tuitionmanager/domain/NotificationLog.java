package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class NotificationLog {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne public Student student;
  @Enumerated(EnumType.STRING) public NotificationType type = NotificationType.GENERAL_ANNOUNCEMENT;
  @Enumerated(EnumType.STRING) public NotificationChannel channel = NotificationChannel.IN_APP;
  public String recipient;
  public String subject;
  @Column(length = 2000) public String message;
  public String status = "QUEUED";
  public Instant createdAt = Instant.now();
  public Instant sentAt;
}
