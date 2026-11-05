package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.GeneratedReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, String> {
    
    List<GeneratedReport> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r FROM GeneratedReport r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:branchCode IS NULL OR r.branchCode = :branchCode) " +
           "ORDER BY r.createdAt DESC")
    List<GeneratedReport> findByFilters(
            @Param("status") String status,
            @Param("branchCode") String branchCode
    );

    @Query("SELECT r FROM GeneratedReport r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:branchCode IS NULL OR r.branchCode = :branchCode) " +
           "ORDER BY r.createdAt DESC")
    Page<GeneratedReport> findByFiltersPaged(
            @Param("status") String status,
            @Param("branchCode") String branchCode,
            Pageable pageable
    );
}
