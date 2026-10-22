package com.reinsurance.portal.repository;

import com.reinsurance.portal.entity.RiskFactorBreakdownEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RiskFactorBreakdownRepository extends JpaRepository<RiskFactorBreakdownEntity, UUID> {
    List<RiskFactorBreakdownEntity> findBySubmissionIdOrderByCreatedAtAsc(UUID submissionId);
    void deleteBySubmissionId(UUID submissionId);
}
