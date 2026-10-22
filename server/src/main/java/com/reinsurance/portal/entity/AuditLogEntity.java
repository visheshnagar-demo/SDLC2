package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_sub_id", columnList = "submission_id"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
public class AuditLogEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "submission_id", nullable = false)
    private UUID submissionId;

    @Column(name = "action_type", nullable = false)
    private String actionType; // INTAKE, STATUS_CHANGE, SCORING, QUOTE_CREATED, REFERRAL_DECISION, DOCUMENT_UPLOAD

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_role")
    private String userRole;

    @Lob
    @Column(name = "change_summary", nullable = false)
    private String changeSummary;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }

    public AuditLogEntity() {}

    public AuditLogEntity(UUID submissionId, String actionType, String userId, String userRole, String changeSummary) {
        this.submissionId = submissionId;
        this.actionType = actionType;
        this.userId = userId;
        this.userRole = userRole;
        this.changeSummary = changeSummary;
        this.timestamp = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSubmissionId() { return submissionId; }
    public void setSubmissionId(UUID submissionId) { this.submissionId = submissionId; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
