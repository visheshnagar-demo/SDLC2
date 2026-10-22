package com.reinsurance.portal.repository;

import com.reinsurance.portal.entity.UnderwritingDecisionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UnderwritingDecisionRepository extends JpaRepository<UnderwritingDecisionEntity, UUID> {
    List<UnderwritingDecisionEntity> findBySubmissionIdOrderByCreatedAtDesc(UUID submissionId);
}
