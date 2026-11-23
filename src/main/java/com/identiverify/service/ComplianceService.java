package com.identiverify.service;

import com.identiverify.dto.AdjudicationRequest;
import com.identiverify.dto.VerificationResponse;
import com.identiverify.entity.User;
import com.identiverify.entity.VerificationRequest;
import com.identiverify.repository.UserRepository;
import com.identiverify.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplianceService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final DocumentOcrService documentOcrService;
    private final BiometricService biometricService;

    public ComplianceService(VerificationRequestRepository verificationRequestRepository,
                             UserRepository userRepository,
                             AuditService auditService,
                             DocumentOcrService documentOcrService,
                             BiometricService biometricService) {
        this.verificationRequestRepository = verificationRequestRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.documentOcrService = documentOcrService;
        this.biometricService = biometricService;
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getFlaggedQueue() {
        List<VerificationRequest> flagged = verificationRequestRepository.findByStatusInOrderByCreatedAtDesc(
                Arrays.asList("FLAGGED", "IN_PROGRESS", "INITIATED", "OCR_PROCESSED")
        );

        return flagged.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public VerificationResponse adjudicate(AdjudicationRequest request, UUID officerId) {
        VerificationRequest verification = verificationRequestRepository.findById(request.getVerificationId())
                .orElseThrow(() -> new NoSuchElementException("Verification request not found with id: " + request.getVerificationId()));

        User officer = null;
        if (officerId != null) {
            officer = userRepository.findById(officerId).orElse(null);
        }

        String decision = request.getManualDecision() != null ? request.getManualDecision().toUpperCase() : "APPROVED";
        String oldStatus = verification.getStatus();

        if ("APPROVED".equals(decision)) {
            verification.setStatus("MANUALLY_APPROVED");
            verification.setManualDecision("APPROVED");
        } else if ("REJECTED".equals(decision)) {
            verification.setStatus("REJECTED");
            verification.setManualDecision("REJECTED");
        } else {
            verification.setStatus("REQUEST_RESUBMISSION");
            verification.setManualDecision("REQUEST_RESUBMISSION");
        }

        verification.setAssignedOfficer(officer);
        verification.setDecisionNotes(request.getDecisionNotes());
        VerificationRequest savedVerification = verificationRequestRepository.save(verification);

        auditService.logEvent(
                "VerificationRequest",
                savedVerification.getId(),
                officer != null ? officer.getId() : null,
                officer != null ? officer.getEmail() : "compliance-officer@identiverify.com",
                "COMPLIANCE_ADJUDICATION",
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"decision\":\"" + decision + "\",\"notes\":\"" + (request.getDecisionNotes() != null ? request.getDecisionNotes() : "") + "\"}",
                "127.0.0.1"
        );

        return mapToResponse(savedVerification);
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
