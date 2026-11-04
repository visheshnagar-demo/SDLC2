package com.citi.cashstatement.service;

import com.citi.cashstatement.entity.AuditLog;
import com.citi.cashstatement.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuditLoggerService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLoggerService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @Async
    public void logEvent(String userId, String actionType, String targetResource, String ipAddress, String userAgent, Object details) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setId(UUID.randomUUID().toString());
            auditLog.setUserId(userId != null ? userId : "SYSTEM");
            auditLog.setActionType(actionType);
            auditLog.setTargetResource(targetResource != null ? targetResource : "N/A");
            auditLog.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
            auditLog.setUserAgent(userAgent != null ? userAgent : "CitiDirect/1.0");
            auditLog.setDetailsJson(details != null ? objectMapper.writeValueAsString(details) : "{}");
            auditLog.setCreatedAt(OffsetDateTime.now());

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Avoid failing primary business flow on audit log failures
            e.printStackTrace();
        }
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
