package com.citidirect.cashstatement.audit;

import com.citidirect.cashstatement.audit.model.AuditTrail;
import com.citidirect.cashstatement.audit.repository.AuditTrailRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditTrailRepository auditRepository;

    public AuditService(AuditTrailRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @Transactional
    public void recordAction(String userId, String username, String action, String entityType, String entityId, String details) {
        AuditTrail trail = new AuditTrail(
                UUID.randomUUID().toString(),
                userId,
                username,
                action,
                entityType,
                entityId,
                details
        );
        trail.setTimestampGmt(OffsetDateTime.now());
        auditRepository.save(trail);
    }

    @Transactional(readOnly = true)
    public List<AuditTrail> getRecentAuditTrails() {
        return auditRepository.findAllByOrderByTimestampGmtDesc();
    }
}
