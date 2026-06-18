package com.tuitionmanager.service;

import com.tuitionmanager.domain.AttendanceStatus;
import com.tuitionmanager.domain.FeePayment;
import com.tuitionmanager.domain.StudentStatus;
import com.tuitionmanager.repository.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
  private final StudentRepository students;
  private final BatchRepository batches;
  private final FeePaymentRepository fees;
  private final ExpenseRepository expenses;
  private final IncomeEntryRepository income;
  private final AttendanceRecordRepository attendance;
  private final ExamRepository exams;

  public DashboardService(StudentRepository students, BatchRepository batches, FeePaymentRepository fees, ExpenseRepository expenses, IncomeEntryRepository income, AttendanceRecordRepository attendance, ExamRepository exams) {
    this.students = students;
    this.batches = batches;
    this.fees = fees;
    this.expenses = expenses;
    this.income = income;
    this.attendance = attendance;
    this.exams = exams;
  }

  public Map<String, Object> summary(YearMonth month) {
    LocalDate start = month.atDay(1);
    LocalDate end = month.atEndOfMonth();
    BigDecimal monthlyIncome = income.findByIncomeDateBetween(start, end).stream().map(i -> i.amount).reduce(BigDecimal.ZERO, BigDecimal::add)
      .add(fees.findAll().stream().filter(f -> f.paymentDate != null && !f.paymentDate.isBefore(start) && !f.paymentDate.isAfter(end)).map(f -> f.paidAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
    BigDecimal monthlyExpenses = expenses.findByExpenseDateBetween(start, end).stream().map(e -> e.amount).reduce(BigDecimal.ZERO, BigDecimal::add);
    long present = attendance.findByAttendanceDateBetween(LocalDate.now(), LocalDate.now()).stream().filter(a -> a.status == AttendanceStatus.PRESENT || a.status == AttendanceStatus.LATE).count();
    long absent = attendance.findByAttendanceDateBetween(LocalDate.now(), LocalDate.now()).stream().filter(a -> a.status == AttendanceStatus.ABSENT).count();
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("totalStudents", students.count());
    data.put("activeStudents", students.findByStatus(StudentStatus.ACTIVE).size());
    data.put("todayClasses", batches.count());
    data.put("monthlyIncome", monthlyIncome);
    data.put("monthlyExpenses", monthlyExpenses);
    data.put("netProfit", monthlyIncome.subtract(monthlyExpenses));
    data.put("pendingFees", currentPendingFees());
    data.put("attendancePresentToday", present);
    data.put("attendanceAbsentToday", absent);
    data.put("upcomingExams", exams.findAll().stream().filter(e -> e.examDate != null && !e.examDate.isBefore(LocalDate.now())).limit(5).toList());
    data.put("recentPayments", fees.findAll().stream().sorted((a, b) -> b.paymentDate.compareTo(a.paymentDate)).limit(5).toList());
    return data;
  }

  private BigDecimal currentPendingFees() {
    Map<String, FeePayment> latest = new LinkedHashMap<>();
    fees.findAll().forEach(payment -> {
      String key = payment.student.id + ":" + payment.feeMonth;
      FeePayment current = latest.get(key);
      if (current == null || payment.createdAt.isAfter(current.createdAt)) latest.put(key, payment);
    });
    return latest.values().stream().map(f -> f.dueAmount == null ? BigDecimal.ZERO : f.dueAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
