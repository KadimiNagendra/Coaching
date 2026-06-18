package com.tuitionmanager.repository;

import com.tuitionmanager.domain.FeePayment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
  List<FeePayment> findByFeeMonth(String feeMonth);
  List<FeePayment> findByStudentIdAndFeeMonth(Long studentId, String feeMonth);
}
