package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.entity.AuditLogEntry;
import com.citidirect.cashstatement.repository.AuditLogEntryRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogEntryRepository auditLogRepository;

    public AuditLogService(AuditLogEntryRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLogEntry logAction(String actorId, String actorName, String actorRole,
                                   String actionType, String entityName, String entityId,
                                   String ipAddress, String payloadSnapshot) {
        AuditLogEntry entry = new AuditLogEntry();
        entry.setActorId(actorId != null ? actorId : "SYSTEM");
        entry.setActorName(actorName != null ? actorName : "Corporate User");
        entry.setActorRole(actorRole != null ? actorRole : "ROLE_MAKER");
        entry.setActionType(actionType);
        entry.setEntityName(entityName);
        entry.setEntityId(entityId);
        entry.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
        entry.setPayloadSnapshot(payloadSnapshot);
        entry.setTimestamp(Instant.now());

        // Compute SHA-256 Checksum
        try {
            String raw = String.format("%s:%s:%s:%s:%s:%s",
                entry.getActorId(), actionType, entityName, entityId, entry.getTimestamp(), payloadSnapshot);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            entry.setChecksum(hexString.toString());
        } catch (Exception e) {
            entry.setChecksum("CHECKSUM_ERROR");
        }

        return auditLogRepository.save(entry);
    }

    public List<AuditLogEntry> getAuditLogsForEntity(String entityId) {
        return auditLogRepository.findByEntityId(entityId);
    }
}
