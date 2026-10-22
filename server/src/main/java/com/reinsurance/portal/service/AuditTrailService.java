package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.AuditLogResponse;
import com.reinsurance.portal.entity.AuditLogEntity;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuditTrailService {

    private final AuditLogRepository auditLogRepository;

    public AuditTrailService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void recordEvent(SubmissionEntity submission, String actionType, String userId, String userRole,
                            String changeSummary, String previousState, String newState) {
        AuditLogEntity log = new AuditLogEntity();
        log.setSubmission(submission);
        log.setActionType(actionType);
        log.setUserId(userId != null ? userId : "system");
        log.setUserRole(userRole != null ? userRole : "SYSTEM");
        log.setChangeSummary(changeSummary);
        log.setPreviousState(previousState);
        log.setNewState(newState);
        log.setTimestamp(Instant.now());
        auditLogRepository.save(log);
    }

    public List<AuditLogResponse> getAuditTrail(UUID submissionId) {
        return auditLogRepository.findBySubmissionIdOrderByTimestampDesc(submissionId)
                .stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        submissionId,
                        log.getActionType(),
                        log.getUserId(),
                        log.getUserRole(),
                        log.getChangeSummary(),
                        log.getPreviousState(),
                        log.getNewState(),
                        log.getTimestamp()
                ))
                .collect(Collectors.toList());
    }
}
