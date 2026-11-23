package com.identiverify.dto;

import java.time.Instant;
import java.util.UUID;

public class AuditLogResponse {

    private UUID id;
    private String entityName;
    private UUID entityId;
    private UUID actorId;
    private String actorEmail;
    private String action;
    private String payloadBefore;
    private String payloadAfter;
    private String clientIp;
    private String hashChain;
    private Instant createdAt;

    public AuditLogResponse() {
    }

    public AuditLogResponse(UUID id, String entityName, UUID entityId, UUID actorId,
                            String actorEmail, String action, String payloadBefore,
                            String payloadAfter, String clientIp, String hashChain, Instant createdAt) {
        this.id = id;
        this.entityName = entityName;
        this.entityId = entityId;
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.action = action;
        this.payloadBefore = payloadBefore;
        this.payloadAfter = payloadAfter;
        this.clientIp = clientIp;
        this.hashChain = hashChain;
        this.createdAt = createdAt;
    }

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
