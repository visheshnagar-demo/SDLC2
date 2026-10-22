package com.reinsurance.portal.repository;

import com.reinsurance.portal.entity.SubmissionDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionDocumentRepository extends JpaRepository<SubmissionDocumentEntity, UUID> {
    List<SubmissionDocumentEntity> findBySubmissionId(UUID submissionId);
}
