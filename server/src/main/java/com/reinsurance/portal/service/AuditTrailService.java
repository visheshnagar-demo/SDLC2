package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.AuditLogResponse;
import com.reinsurance.portal.entity.AuditLogEntity;
import com.reinsurance.portal.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public void logAction(UUID submissionId, String actionType, String userId, String userRole, String changeSummary) {
        AuditLogEntity log = new AuditLogEntity(
            submissionId,
            actionType,
            userId != null ? userId : "system",
            userRole != null ? userRole : "ROLE_UNDERWRITER",
            changeSummary
        );
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsForSubmission(UUID submissionId) {
        return auditLogRepository.findBySubmissionIdOrderByTimestampAsc(submissionId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private AuditLogResponse toResponse(AuditLogEntity entity) {
        return new AuditLogResponse(
            entity.getId(),
            entity.getSubmissionId(),
            entity.getActionType(),
            entity.getUserId(),
            entity.getUserRole(),
            entity.getChangeSummary(),
            entity.getTimestamp()
        );
    }
}
