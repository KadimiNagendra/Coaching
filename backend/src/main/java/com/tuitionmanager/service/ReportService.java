package com.tuitionmanager.service;

import com.tuitionmanager.domain.*;
import com.tuitionmanager.repository.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.function.Consumer;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReportService {
  private final StudentRepository students;
  private final FeePaymentRepository fees;
  private final ExpenseRepository expenses;
  private final IncomeEntryRepository income;
  private final ExamResultRepository examResults;

  public ReportService(StudentRepository students, FeePaymentRepository fees, ExpenseRepository expenses, IncomeEntryRepository income, ExamResultRepository examResults) {
    this.students = students;
    this.fees = fees;
    this.expenses = expenses;
    this.income = income;
    this.examResults = examResults;
  }

  public String csv(String type) {
    return switch (type) {
      case "students" -> csv("Student ID,Name,Class,Subjects,Status", students.findAll().stream().map(s -> List.of(s.studentId, s.studentName, s.classGrade, safe(s.subjectsEnrolled), String.valueOf(s.status))).toList());
      case "fees" -> csv("Payment ID,Student,Month,Paid,Due", fees.findAll().stream().map(f -> List.of(f.paymentId, f.student.studentName, f.feeMonth, String.valueOf(f.paidAmount), String.valueOf(f.dueAmount))).toList());
      case "expenses" -> csv("Date,Category,Amount,Vendor", expenses.findAll().stream().map(e -> List.of(String.valueOf(e.expenseDate), String.valueOf(e.expenseCategory), String.valueOf(e.amount), safe(e.vendorName))).toList());
      case "income" -> csv("Income ID,Date,Source,Amount,Description", income.findAll().stream().map(i -> List.of(i.incomeId, String.valueOf(i.incomeDate), safe(i.source), String.valueOf(i.amount), safe(i.description))).toList());
      case "profit-loss" -> profitLossCsv();
      case "exams" -> csv("Exam,Subject,Student,Total Marks,Obtained,Percentage,Grade", examResults.findAll().stream().map(r -> List.of(r.exam.examName, r.exam.subject, r.student.studentName, String.valueOf(r.totalMarks), String.valueOf(r.obtainedMarks), String.valueOf(r.percentage), safe(r.grade))).toList());
      default -> throw notFound(type);
    };
  }

  public byte[] excel(String type) throws IOException {
    return switch (type) {
      case "students" -> workbook(wb -> {
        Sheet sheet = sheet(wb, "Students");
        header(sheet, "Student ID", "Name", "Class", "Subjects", "Status");
        int row = 1;
        for (Student student : students.findAll()) {
          row(sheet.createRow(row++), student.studentId, student.studentName, student.classGrade, student.subjectsEnrolled, student.status);
        }
      });
      case "fees" -> workbook(wb -> {
        Sheet sheet = sheet(wb, "Fee Collections");
        header(sheet, "Payment ID", "Student", "Month", "Paid", "Due");
        int row = 1;
        for (FeePayment payment : fees.findAll()) {
          row(sheet.createRow(row++), payment.paymentId, payment.student.studentName, payment.feeMonth, payment.paidAmount, payment.dueAmount);
        }
      });
      case "expenses" -> workbook(wb -> {
        Sheet sheet = sheet(wb, "Expenses");
        header(sheet, "Date", "Category", "Amount", "Vendor", "Payment Method");
        int row = 1;
        for (Expense expense : expenses.findAll()) {
          row(sheet.createRow(row++), expense.expenseDate, expense.expenseCategory, expense.amount, expense.vendorName, expense.paymentMethod);
        }
      });
      case "income" -> workbook(wb -> {
        Sheet sheet = sheet(wb, "Income");
        header(sheet, "Income ID", "Date", "Source", "Amount", "Description");
        int row = 1;
        for (IncomeEntry entry : income.findAll()) {
          row(sheet.createRow(row++), entry.incomeId, entry.incomeDate, entry.source, entry.amount, entry.description);
        }
      });
      case "profit-loss" -> profitLossExcel();
      case "exams" -> workbook(wb -> {
        Sheet sheet = sheet(wb, "Exam Performance");
        header(sheet, "Exam", "Subject", "Class", "Student", "Total Marks", "Obtained", "Percentage", "Grade");
        int row = 1;
        for (ExamResult result : examResults.findAll()) {
          row(sheet.createRow(row++), result.exam.examName, result.exam.subject, result.exam.classGrade, result.student.studentName, result.totalMarks, result.obtainedMarks, result.percentage, result.grade);
        }
      });
      default -> throw notFound(type);
    };
  }

  private byte[] profitLossExcel() throws IOException {
    BigDecimal incomeTotal = sum(income.findAll().stream().map(i -> i.amount).toList());
    BigDecimal feeTotal = sum(fees.findAll().stream().map(f -> f.paidAmount).toList());
    BigDecimal expenseTotal = sum(expenses.findAll().stream().map(e -> e.amount).toList());
    BigDecimal netProfit = incomeTotal.add(feeTotal).subtract(expenseTotal);
    return workbook(wb -> {
      Sheet sheet = sheet(wb, "Profit and Loss");
      header(sheet, "Metric", "Amount (Rs)");
      row(sheet.createRow(1), "Total Income Entries", incomeTotal);
      row(sheet.createRow(2), "Fee Collections", feeTotal);
      row(sheet.createRow(3), "Total Expenses", expenseTotal);
      row(sheet.createRow(4), "Net Profit", netProfit);
    });
  }

  private String profitLossCsv() {
    BigDecimal incomeTotal = sum(income.findAll().stream().map(i -> i.amount).toList());
    BigDecimal feeTotal = sum(fees.findAll().stream().map(f -> f.paidAmount).toList());
    BigDecimal expenseTotal = sum(expenses.findAll().stream().map(e -> e.amount).toList());
    BigDecimal netProfit = incomeTotal.add(feeTotal).subtract(expenseTotal);
    return csv("Metric,Amount (Rs)", List.of(
      List.of("Total Income Entries", incomeTotal.toString()),
      List.of("Fee Collections", feeTotal.toString()),
      List.of("Total Expenses", expenseTotal.toString()),
      List.of("Net Profit", netProfit.toString())
    ));
  }

  private String csv(String header, List<List<String>> rows) {
    StringBuilder builder = new StringBuilder(header).append('\n');
    rows.forEach(row -> builder.append(String.join(",", row.stream().map(this::safe).toList())).append('\n'));
    return builder.toString();
  }

  private byte[] workbook(Consumer<Workbook> builder) throws IOException {
    try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      builder.accept(workbook);
      workbook.write(output);
      return output.toByteArray();
    }
  }

  private Sheet sheet(Workbook workbook, String name) {
    return workbook.createSheet(name);
  }

  private void header(Sheet sheet, String... labels) {
    Row row = sheet.createRow(0);
    CellStyle style = sheet.getWorkbook().createCellStyle();
    Font font = sheet.getWorkbook().createFont();
    font.setBold(true);
    style.setFont(font);
    for (int i = 0; i < labels.length; i++) {
      Cell cell = row.createCell(i);
      cell.setCellValue(labels[i]);
      cell.setCellStyle(style);
    }
  }

  private void row(Row row, Object... values) {
    for (int i = 0; i < values.length; i++) {
      Cell cell = row.createCell(i);
      Object value = values[i];
      if (value == null) cell.setBlank();
      else if (value instanceof BigDecimal amount) cell.setCellValue(amount.doubleValue());
      else if (value instanceof Number number) cell.setCellValue(number.doubleValue());
      else cell.setCellValue(String.valueOf(value));
    }
  }

  private BigDecimal sum(List<BigDecimal> values) {
    return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private String safe(String value) {
    return value == null ? "" : value.replace(",", " ");
  }

  private ResponseStatusException notFound(String type) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found: " + type);
  }
}
