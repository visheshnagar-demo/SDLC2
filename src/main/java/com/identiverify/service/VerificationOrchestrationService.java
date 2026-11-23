package com.identiverify.service;

import com.identiverify.dto.VerificationResponse;
import com.identiverify.entity.User;
import com.identiverify.entity.VerificationRequest;
import com.identiverify.repository.UserRepository;
import com.identiverify.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VerificationOrchestrationService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final UserRepository userRepository;
    private final DocumentOcrService documentOcrService;
    private final BiometricService biometricService;
    private final AuditService auditService;

    public VerificationOrchestrationService(VerificationRequestRepository verificationRequestRepository,
                                            UserRepository userRepository,
                                            DocumentOcrService documentOcrService,
                                            BiometricService biometricService,
                                            AuditService auditService) {
        this.verificationRequestRepository = verificationRequestRepository;
        this.userRepository = userRepository;
        this.documentOcrService = documentOcrService;
        this.biometricService = biometricService;
        this.auditService = auditService;
    }

    @Transactional
    public VerificationResponse createVerification(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));

        VerificationRequest verification = new VerificationRequest(user);
        verification.setStatus("INITIATED");
        verification.setAutoDecision("PENDING");
        verification.setOverallRiskScore(50.0);

        VerificationRequest savedVerification = verificationRequestRepository.save(verification);

        auditService.logEvent(
                "VerificationRequest",
                savedVerification.getId(),
                user.getId(),
                user.getEmail(),
                "VERIFICATION_INITIATED",
                null,
                "{\"status\":\"INITIATED\"}",
                "127.0.0.1"
        );

        return mapToResponse(savedVerification);
    }

    @Transactional(readOnly = true)
    public VerificationResponse getVerificationById(UUID verificationId) {
        VerificationRequest req = verificationRequestRepository.findById(verificationId)
                .orElseThrow(() -> new NoSuchElementException("Verification request not found with id: " + verificationId));
        return mapToResponse(req);
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getVerificationsForUser(UUID userId) {
        return verificationRequestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getAllVerifications() {
        return verificationRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public VerificationResponse mapToResponse(VerificationRequest req) {
        VerificationResponse res = new VerificationResponse();
        res.setId(req.getId());
        res.setUserId(req.getUser().getId());
        res.setUserEmail(req.getUser().getEmail());
        res.setUserFullName(req.getUser().getFullName());
        res.setStatus(req.getStatus());
        res.setOverallRiskScore(req.getOverallRiskScore());
        res.setAutoDecision(req.getAutoDecision());
        res.setManualDecision(req.getManualDecision());
        res.setAssignedOfficerId(req.getAssignedOfficer() != null ? req.getAssignedOfficer().getId() : null);
        res.setDecisionNotes(req.getDecisionNotes());
        res.setCreatedAt(req.getCreatedAt());
        res.setUpdatedAt(req.getUpdatedAt());
        res.setDocuments(documentOcrService.getDocumentsByVerificationId(req.getId()));
        biometricService.getBiometricCheckByVerificationId(req.getId()).ifPresent(res::setBiometricCheck);
        return res;
    }
}
