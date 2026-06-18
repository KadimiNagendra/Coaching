package com.tuitionmanager.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance_records", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "attendanceDate"}))
public class AttendanceRecord {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(optional = false)
  public Student student;

  @Column(nullable = false)
  public LocalDate attendanceDate = LocalDate.now();

  @Enumerated(EnumType.STRING)
  public AttendanceStatus status = AttendanceStatus.PRESENT;

  @Column(length = 1000) public String remarks;
}
