package com.reinsurance.portal.repository;

import com.reinsurance.portal.entity.QuoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuoteRepository extends JpaRepository<QuoteEntity, UUID> {
    Optional<QuoteEntity> findBySubmissionId(UUID submissionId);
    long countByStatus(String status);
}
