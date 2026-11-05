package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.entity.AuditLog;
import com.citidirect.cashstatement.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog log(String userId, String action, String resourceType, String resourceId, String clientIp, String userAgent, String details) {
        String logId = UUID.randomUUID().toString();
        AuditLog auditLog = new AuditLog(
                logId,
                userId != null ? userId : "anonymous",
                action,
                resourceType,
                resourceId,
                clientIp != null ? clientIp : "127.0.0.1",
                userAgent != null ? userAgent : "CitiDirect Web Client",
                details
        );
        return auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
