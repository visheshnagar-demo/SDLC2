package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.SubmissionDecisionRequest;
import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.entity.UnderwritingDecisionEntity;
import com.reinsurance.portal.repository.SubmissionRepository;
import com.reinsurance.portal.repository.UnderwritingDecisionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@Service
public class DecisionWorkflowService {

    private final SubmissionRepository submissionRepository;
    private final UnderwritingDecisionRepository decisionRepository;
    private final IntakeService intakeService;
    private final AuditTrailService auditTrailService;

    @Value("${app.underwriting.default-authority-limit:5000000.00}")
    private BigDecimal defaultAuthorityLimit;

    private static final Set<String> VALID_STATUSES = Set.of(
        "RECEIVED", "IN_REVIEW", "INFO_REQUESTED", "QUOTED", "BOUND", "DECLINED", "REFERRED_TO_MANAGER"
    );

    public DecisionWorkflowService(
            SubmissionRepository submissionRepository,
            UnderwritingDecisionRepository decisionRepository,
            IntakeService intakeService,
            AuditTrailService auditTrailService) {
        this.submissionRepository = submissionRepository;
        this.decisionRepository = decisionRepository;
        this.intakeService = intakeService;
        this.auditTrailService = auditTrailService;
    }

    @Transactional
    public SubmissionResponse transitionStatus(UUID submissionId, SubmissionDecisionRequest request, String userId, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new NoSuchElementException("Submission not found with ID: " + submissionId));

        String targetStatus = request.targetStatus().toUpperCase().trim();
        if (!VALID_STATUSES.contains(targetStatus)) {
            throw new IllegalArgumentException("Invalid target status: " + targetStatus + ". Valid statuses: " + VALID_STATUSES);
        }

        // Validate mandatory decline reason
        if ("DECLINED".equals(targetStatus)) {
            if (request.declineReason() == null || request.declineReason().trim().isBlank()) {
                throw new IllegalArgumentException("Mandatory decline reason is required when declining a submission");
            }
        }

        // Authority limit check on quoting/binding
        boolean isManager = userRole != null && (userRole.contains("MANAGER") || userRole.contains("ADMIN"));
        if (("QUOTED".equals(targetStatus) || "BOUND".equals(targetStatus)) && !isManager) {
            if (submission.getPolicyLimit().compareTo(defaultAuthorityLimit) > 0 && !submission.isReferred()) {
                submission.setReferred(true);
                targetStatus = "REFERRED_TO_MANAGER";
            }
        }

        String prevStatus = submission.getStatus();
        submission.setStatus(targetStatus);
        SubmissionEntity saved = submissionRepository.save(submission);

        // Record underwriting decision
        UnderwritingDecisionEntity decision = new UnderwritingDecisionEntity(
            saved,
            prevStatus,
            targetStatus,
            request.declineReason(),
            request.notes(),
            userId != null ? userId : "underwriter"
        );
        decisionRepository.save(decision);

        // Audit log
        String summary = String.format("Status transitioned from '%s' to '%s'. Reason: %s. Notes: %s",
            prevStatus, targetStatus,
            request.declineReason() != null ? request.declineReason() : "N/A",
            request.notes() != null ? request.notes() : "N/A");
        auditTrailService.logAction(submissionId, "STATUS_CHANGE", userId, userRole, summary);

        return intakeService.toResponse(saved);
    }

    @Transactional
    public SubmissionResponse processReferralDecision(UUID submissionId, String decision, String managerNotes, BigDecimal approvedLimit, String managerId, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new NoSuchElementException("Submission not found with ID: " + submissionId));

        String prevStatus = submission.getStatus();
        String newStatus;
        if ("APPROVE".equalsIgnoreCase(decision) || "APPROVED".equalsIgnoreCase(decision)) {
            submission.setReferred(false); // Referral cleared
            newStatus = "IN_REVIEW"; // Return to in review or allow quoting
        } else {
            newStatus = "DECLINED";
            submission.setReferred(false);
        }
        submission.setStatus(newStatus);
        SubmissionEntity saved = submissionRepository.save(submission);

        UnderwritingDecisionEntity dec = new UnderwritingDecisionEntity(
            saved,
            prevStatus,
            newStatus,
            "APPROVE".equalsIgnoreCase(decision) ? null : "Manager Referral Rejected: " + managerNotes,
            managerNotes,
            managerId != null ? managerId : "manager"
        );
        decisionRepository.save(dec);

        String summary = String.format("Manager Referral Decision: %s. Previous Status: %s, New Status: %s. Approved Limit: %s. Notes: %s",
            decision.toUpperCase(), prevStatus, newStatus,
            approvedLimit != null ? "$" + approvedLimit.toPlainString() : "Default",
            managerNotes != null ? managerNotes : "N/A");
        auditTrailService.logAction(submissionId, "REFERRAL_DECISION", managerId, userRole, summary);

        return intakeService.toResponse(saved);
    }
}
