package com.identiverify.service;

import com.identiverify.dto.BiometricCheckRequest;
import com.identiverify.dto.BiometricCheckResponse;
import com.identiverify.entity.BiometricCheck;
import com.identiverify.entity.VerificationRequest;
import com.identiverify.repository.BiometricCheckRepository;
import com.identiverify.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
public class BiometricService {

    private final BiometricCheckRepository biometricCheckRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final AuditService auditService;

    public BiometricService(BiometricCheckRepository biometricCheckRepository,
                            VerificationRequestRepository verificationRequestRepository,
                            AuditService auditService) {
        this.biometricCheckRepository = biometricCheckRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.auditService = auditService;
    }

    @Transactional
    public BiometricCheckResponse processLivenessAndMatch(BiometricCheckRequest request) {
        VerificationRequest verification = verificationRequestRepository.findById(request.getVerificationId())
                .orElseThrow(() -> new NoSuchElementException("Verification request not found with id: " + request.getVerificationId()));

        // Simulate 3D PAD liveness check and 1:1 facial embedding cosine similarity
        double livenessScore = 98.8;
        String livenessStatus = "PASSED";

        double matchConfidence = 97.5;
        String matchStatus = "MATCHED";

        // Calculate overall risk score (lower risk score = higher confidence / safer)
        // High confidence (>85%) -> risk < 20%
        double overallRiskScore = 15.0;
        String autoDecision;
        String verificationStatus;

        if (matchConfidence >= 85.0 && "PASSED".equals(livenessStatus)) {
            autoDecision = "APPROVED";
            verificationStatus = "AUTO_APPROVED";
            overallRiskScore = 12.5;
        } else if (matchConfidence >= 50.0) {
            autoDecision = "FLAGGED";
            verificationStatus = "FLAGGED";
            overallRiskScore = 65.0;
        } else {
            autoDecision = "REJECTED";
            verificationStatus = "REJECTED";
            overallRiskScore = 90.0;
        }

        BiometricCheck biometricCheck = new BiometricCheck();
        biometricCheck.setVerificationRequest(verification);
        biometricCheck.setLivenessScore(livenessScore);
        biometricCheck.setLivenessStatus(livenessStatus);
        biometricCheck.setMatchConfidenceScore(matchConfidence);
        biometricCheck.setMatchStatus(matchStatus);
        biometricCheck.setSelfieStoragePath("gcs://identiverify-biometrics/" + UUID.randomUUID() + "_selfie.png");

        BiometricCheck savedCheck = biometricCheckRepository.save(biometricCheck);

        // Update verification request
        verification.setOverallRiskScore(overallRiskScore);
        verification.setAutoDecision(autoDecision);
        verification.setStatus(verificationStatus);
        verificationRequestRepository.save(verification);

        auditService.logEvent(
                "BiometricCheck",
                savedCheck.getId(),
                verification.getUser().getId(),
                verification.getUser().getEmail(),
                "BIOMETRIC_LIVENESS_AND_MATCH",
                null,
                "{\"livenessScore\":" + livenessScore + ",\"matchConfidence\":" + matchConfidence + ",\"autoDecision\":\"" + autoDecision + "\"}",
                "127.0.0.1"
        );

        return new BiometricCheckResponse(
                savedCheck.getId(),
                verification.getId(),
                savedCheck.getLivenessScore(),
                savedCheck.getLivenessStatus(),
                savedCheck.getMatchConfidenceScore(),
                savedCheck.getMatchStatus(),
                verification.getOverallRiskScore(),
                verification.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public Optional<BiometricCheckResponse> getBiometricCheckByVerificationId(UUID verificationId) {
        return biometricCheckRepository.findTopByVerificationRequestIdOrderByCreatedAtDesc(verificationId)
                .map(check -> new BiometricCheckResponse(
                        check.getId(),
                        check.getVerificationRequest().getId(),
                        check.getLivenessScore(),
                        check.getLivenessStatus(),
                        check.getMatchConfidenceScore(),
                        check.getMatchStatus(),
                        check.getVerificationRequest().getOverallRiskScore(),
                        check.getVerificationRequest().getStatus()
                ));
    }
}
