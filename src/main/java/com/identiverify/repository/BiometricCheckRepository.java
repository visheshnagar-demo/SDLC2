package com.identiverify.repository;

import com.identiverify.entity.BiometricCheck;
import com.identiverify.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BiometricCheckRepository extends JpaRepository<BiometricCheck, UUID> {
    List<BiometricCheck> findByVerificationRequestOrderByCreatedAtDesc(VerificationRequest verificationRequest);
    Optional<BiometricCheck> findTopByVerificationRequestIdOrderByCreatedAtDesc(UUID verificationId);
}
