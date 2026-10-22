package com.reinsurance.portal.repository;

import com.reinsurance.portal.entity.SubmissionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID>, JpaSpecificationExecutor<SubmissionEntity> {

    List<SubmissionEntity> findByCedingCompanyNameOrderByCreatedAtDesc(String cedingCompanyName);

    Page<SubmissionEntity> findByCedingCompanyName(String cedingCompanyName, Pageable pageable);

    List<SubmissionEntity> findByStatus(String status);

    List<SubmissionEntity> findByLineOfBusiness(String lineOfBusiness);

    @Query("SELECT s.lineOfBusiness, COUNT(s) FROM SubmissionEntity s GROUP BY s.lineOfBusiness")
    List<Object[]> countSubmissionsByLineOfBusiness();

    @Query("SELECT s.status, COUNT(s) FROM SubmissionEntity s GROUP BY s.status")
    List<Object[]> countSubmissionsByStatus();

    @Query("SELECT s.lineOfBusiness, SUM(s.policyLimit) FROM SubmissionEntity s GROUP BY s.lineOfBusiness")
    List<Object[]> sumPolicyLimitByLineOfBusiness();
}
