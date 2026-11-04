package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.GeneratedReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, String> {
    Page<GeneratedReport> findByStatusIgnoreCase(String status, Pageable pageable);
    List<GeneratedReport> findByGeneratedBy(String generatedBy);
    List<GeneratedReport> findByOrderByCreatedAtDesc();
}
