package com.identiverify.service;

import com.identiverify.dto.AuditLogResponse;
import com.identiverify.entity.AuditLog;
import com.identiverify.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog logEvent(String entityName, UUID entityId, UUID actorId, String actorEmail,
                             String action, String payloadBefore, String payloadAfter, String clientIp) {
        Optional<AuditLog> latestLog = auditLogRepository.findTopByOrderByCreatedAtDesc();
        String prevHash = latestLog.map(AuditLog::getHashChain).orElse("GENESIS_BLOCK_HASH_0000000000000000000000000000000000000000000000");

        String newHash = calculateHash(prevHash, entityName, entityId, actorId, action, payloadAfter, Instant.now().toString());

        AuditLog log = new AuditLog(
                entityName,
                entityId,
                actorId,
                actorEmail,
                action,
                payloadBefore,
                payloadAfter,
                clientIp != null ? clientIp : "127.0.0.1",
                newHash
        );

        return auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllLogs(String entityName, UUID actorId) {
        List<AuditLog> logs;
        if (entityName != null && !entityName.isBlank()) {
            logs = auditLogRepository.findByEntityNameOrderByCreatedAtDesc(entityName);
        } else if (actorId != null) {
            logs = auditLogRepository.findByActorIdOrderByCreatedAtDesc(actorId);
        } else {
            logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        }

        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getEntityName(),
                log.getEntityId(),
                log.getActorId(),
                log.getActorEmail(),
                log.getAction(),
                log.getPayloadBefore(),
                log.getPayloadAfter(),
                log.getClientIp(),
                log.getHashChain(),
                log.getCreatedAt()
        );
    }

    private String calculateHash(String prevHash, String entityName, UUID entityId, UUID actorId,
                                 String action, String payloadAfter, String timestamp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String data = String.format("%s:%s:%s:%s:%s:%s:%s",
                    prevHash, entityName, entityId, actorId, action, payloadAfter != null ? payloadAfter : "", timestamp);
            byte[] encodedhash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return "HASH_ERROR_" + UUID.randomUUID();
        }
    }
}
