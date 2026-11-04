package com.citidirect.cashstatement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 36)
    private String userId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 100)
    private String resourceType;

    @Column(nullable = false, length = 36)
    private String resourceId;

    @Column(nullable = false, length = 45)
    private String clientIp = "127.0.0.1";

    @Column(columnDefinition = "TEXT")
    private String userAgent = "CitiDirect-WebClient";

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private Instant createdAt;

    public AuditLog() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
    }

    public AuditLog(String userId, String action, String resourceType, String resourceId, String clientIp, String details) {
        this();
        this.userId = userId;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.clientIp = clientIp != null ? clientIp : "127.0.0.1";
        this.details = details;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
