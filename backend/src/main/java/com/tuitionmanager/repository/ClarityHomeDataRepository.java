package com.tuitionmanager.repository;

import com.tuitionmanager.domain.ClarityHomeData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClarityHomeDataRepository extends JpaRepository<ClarityHomeData, String> {
}
