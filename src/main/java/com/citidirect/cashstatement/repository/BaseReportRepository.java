package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.BaseReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BaseReportRepository extends JpaRepository<BaseReport, String> {
    Optional<BaseReport> findByReportCode(String reportCode);
}
