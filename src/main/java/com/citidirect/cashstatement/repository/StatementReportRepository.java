package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.StatementReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatementReportRepository extends JpaRepository<StatementReport, String> {
    List<StatementReport> findByAccountNumber(String accountNumber);
    List<StatementReport> findByBranchCode(String branchCode);
    List<StatementReport> findByGenerationStatus(String generationStatus);

    @Query("SELECT r FROM StatementReport r WHERE " +
           "(:accountNumber IS NULL OR r.accountNumber = :accountNumber) AND " +
           "(:branchCode IS NULL OR r.branchCode = :branchCode) AND " +
           "(:status IS NULL OR r.generationStatus = :status) AND " +
           "(:currency IS NULL OR r.currency = :currency)")
    List<StatementReport> searchReports(
            @Param("accountNumber") String accountNumber,
            @Param("branchCode") String branchCode,
            @Param("status") String status,
            @Param("currency") String currency
    );
}
