package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.entity.AuditLog;
import com.citidirect.cashstatement.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog logAction(String userId, String action, String resourceType, String resourceId, String clientIp, String details) {
        AuditLog auditLog = new AuditLog(userId, action, resourceType, resourceId, clientIp, details);
        return auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsForUser(String userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findByOrderByCreatedAtDesc();
    }
}
