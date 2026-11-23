package com.identiverify.repository;

import com.identiverify.entity.IdentityDocument;
import com.identiverify.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IdentityDocumentRepository extends JpaRepository<IdentityDocument, UUID> {
    List<IdentityDocument> findByVerificationRequestOrderByCreatedAtDesc(VerificationRequest verificationRequest);
    List<IdentityDocument> findByVerificationRequestId(UUID verificationId);
}
