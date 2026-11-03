package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_log_entry")
public class AuditLogEntry {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "actor_id", nullable = false, length = 36)
    private String actorId;

    @Column(name = "actor_name", length = 150)
    private String actorName;

    @Column(name = "actor_role", length = 50)
    private String actorRole;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType; // CREATE, GENERATE, AUTHORIZE, REJECT, EXPORT

    @Column(name = "entity_name", length = 100)
    private String entityName;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "payload_snapshot", columnDefinition = "TEXT")
    private String payloadSnapshot;

    @Column(length = 64)
    private String checksum;

    @Column(name = "timestamp")
    private Instant timestamp = Instant.now();

    public AuditLogEntry() {
        this.id = UUID.randomUUID().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getPayloadSnapshot() { return payloadSnapshot; }
    public void setPayloadSnapshot(String payloadSnapshot) { this.payloadSnapshot = payloadSnapshot; }

    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
