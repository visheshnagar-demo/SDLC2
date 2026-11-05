package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.ReportCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportCriteriaRepository extends JpaRepository<ReportCriteria, String> {
    List<ReportCriteria> findByCreatedBy(String createdBy);
}
