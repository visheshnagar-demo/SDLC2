package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.SubmissionDecisionRequest;
import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.entity.UnderwritingDecisionEntity;
import com.reinsurance.portal.repository.SubmissionRepository;
import com.reinsurance.portal.repository.UnderwritingAuthorityRepository;
import com.reinsurance.portal.repository.UnderwritingDecisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
public class DecisionWorkflowService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "RECEIVED", "IN_REVIEW", "INFO_REQUESTED", "QUOTED", "BOUND", "DECLINED", "REFERRED_TO_MANAGER"
    );

    private final SubmissionRepository submissionRepository;
    private final UnderwritingDecisionRepository decisionRepository;
    private final UnderwritingAuthorityRepository authorityRepository;
    private final UnderwriterQueueService queueService;
    private final AuditTrailService auditTrailService;

    public DecisionWorkflowService(SubmissionRepository submissionRepository,
                                   UnderwritingDecisionRepository decisionRepository,
                                   UnderwritingAuthorityRepository authorityRepository,
                                   UnderwriterQueueService queueService,
                                   AuditTrailService auditTrailService) {
        this.submissionRepository = submissionRepository;
        this.decisionRepository = decisionRepository;
        this.authorityRepository = authorityRepository;
        this.queueService = queueService;
        this.auditTrailService = auditTrailService;
    }

    @Transactional
    public SubmissionResponse updateStatus(UUID submissionId, SubmissionDecisionRequest request, String userEmail, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with ID: " + submissionId));

        String targetStatus = request.targetStatus().toUpperCase();
        if (!VALID_STATUSES.contains(targetStatus)) {
            throw new IllegalArgumentException("Invalid status: " + targetStatus);
        }

        if ("DECLINED".equalsIgnoreCase(targetStatus)) {
            if (request.declineReason() == null || request.declineReason().trim().isEmpty()) {
                throw new IllegalArgumentException("Mandatory decline reason is required when declining a submission");
            }
        }

        String prevStatus = submission.getStatus();

        // Check authority limit on Bound / Quoted
        BigDecimal authorityLimit = authorityRepository.findByRoleName("UNDERWRITER")
                .map(a -> a.getMaxPolicyLimit())
                .orElse(BigDecimal.valueOf(5000000.00));

        if ("QUOTED".equalsIgnoreCase(targetStatus) || "BOUND".equalsIgnoreCase(targetStatus)) {
            if (!"ROLE_MANAGER".equalsIgnoreCase(userRole) && submission.getPolicyLimit().compareTo(authorityLimit) > 0) {
                targetStatus = "REFERRED_TO_MANAGER";
                submission.setIsReferred(true);
            }
        }

        submission.setStatus(targetStatus);
        SubmissionEntity updated = submissionRepository.save(submission);

        // Record Decision
        UnderwritingDecisionEntity decision = new UnderwritingDecisionEntity();
        decision.setSubmission(submission);
        decision.setPreviousStatus(prevStatus);
        decision.setNewStatus(targetStatus);
        decision.setDeclineReason(request.declineReason());
        decision.setUnderwriterNotes(request.underwriterNotes());
        decision.setDecidedBy(userEmail);
        decision.setUserRole(userRole);
        decision.setCreatedAt(Instant.now());
        decisionRepository.save(decision);

        // Record Audit
        auditTrailService.recordEvent(
                updated,
                "STATUS_CHANGE",
                userEmail,
                userRole,
                "Status transitioned from " + prevStatus + " to " + targetStatus + (request.declineReason() != null ? " (Reason: " + request.declineReason() + ")" : ""),
                prevStatus,
                targetStatus
        );

        return queueService.getSubmissionDetail(updated);
    }

    @Transactional
    public SubmissionResponse handleManagerReferral(UUID submissionId, String decision, String managerNotes, String userEmail, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with ID: " + submissionId));

        if (!"ROLE_MANAGER".equalsIgnoreCase(userRole)) {
            throw new SecurityException("Only Underwriting Managers can decide on referrals");
        }

        String prevStatus = submission.getStatus();
        String targetStatus;

        if ("APPROVE".equalsIgnoreCase(decision)) {
            targetStatus = "QUOTED";
            submission.setIsReferred(false);
        } else {
            targetStatus = "DECLINED";
            submission.setIsReferred(false);
        }

        submission.setStatus(targetStatus);
        SubmissionEntity updated = submissionRepository.save(submission);

        UnderwritingDecisionEntity dec = new UnderwritingDecisionEntity();
        dec.setSubmission(submission);
        dec.setPreviousStatus(prevStatus);
        dec.setNewStatus(targetStatus);
        dec.setUnderwriterNotes("Manager Referral Decision: " + decision + ". Notes: " + managerNotes);
        dec.setDecidedBy(userEmail);
        dec.setUserRole("ROLE_MANAGER");
        dec.setCreatedAt(Instant.now());
        decisionRepository.save(dec);

        auditTrailService.recordEvent(
                updated,
                "REFERRAL_DECIDED",
                userEmail,
                "ROLE_MANAGER",
                "Manager referral " + decision + " by " + userEmail + ". New status: " + targetStatus,
                prevStatus,
                targetStatus
        );

        return queueService.getSubmissionDetail(updated);
    }
}
