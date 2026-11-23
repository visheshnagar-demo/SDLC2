package com.identiverify.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "entity_name", nullable = false)
    private String entityName;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_email")
    private String actorEmail;

    @Column(nullable = false)
    private String action;

    @Column(name = "payload_before", columnDefinition = "TEXT")
    private String payloadBefore;

    @Column(name = "payload_after", columnDefinition = "TEXT")
    private String payloadAfter;

    @Column(name = "client_ip")
    private String clientIp;

    @Column(name = "hash_chain", length = 64)
    private String hashChain;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AuditLog() {
    }

    public AuditLog(String entityName, UUID entityId, UUID actorId, String actorEmail,
                    String action, String payloadBefore, String payloadAfter, String clientIp, String hashChain) {
        this.entityName = entityName;
        this.entityId = entityId;
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.action = action;
        this.payloadBefore = payloadBefore;
        this.payloadAfter = payloadAfter;
        this.clientIp = clientIp;
        this.hashChain = hashChain;
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public UUID getEntityId() {
        return entityId;
    }

    public void setEntityId(UUID entityId) {
        this.entityId = entityId;
    }

    public UUID getActorId() {
        return actorId;
    }

    public void setActorId(UUID actorId) {
        this.actorId = actorId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getPayloadBefore() {
        return payloadBefore;
    }

    public void setPayloadBefore(String payloadBefore) {
        this.payloadBefore = payloadBefore;
    }

    public String getPayloadAfter() {
        return payloadAfter;
    }

    public void setPayloadAfter(String payloadAfter) {
        this.payloadAfter = payloadAfter;
    }

    public String getClientIp() {
        return clientIp;
    }

    public void setClientIp(String clientIp) {
        this.clientIp = clientIp;
    }

    public String getHashChain() {
        return hashChain;
    }

    public void setHashChain(String hashChain) {
        this.hashChain = hashChain;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
