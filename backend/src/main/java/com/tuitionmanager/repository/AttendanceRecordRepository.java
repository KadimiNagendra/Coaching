package com.tuitionmanager.repository;

import com.tuitionmanager.domain.AttendanceRecord;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
  List<AttendanceRecord> findByAttendanceDateBetween(LocalDate start, LocalDate end);
  Optional<AttendanceRecord> findByStudentIdAndAttendanceDate(Long studentId, LocalDate attendanceDate);
}
