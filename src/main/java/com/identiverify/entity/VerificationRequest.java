package com.identiverify.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_requests")
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String status = "INITIATED"; // INITIATED, DOCUMENTS_UPLOADED, OCR_PROCESSED, BIOMETRICS_COMPLETED, AUTO_APPROVED, FLAGGED, MANUALLY_APPROVED, REJECTED

    @Column(name = "overall_risk_score")
    private Double overallRiskScore;

    @Column(name = "auto_decision")
    private String autoDecision; // APPROVED, FLAGGED, REJECTED, PENDING

    @Column(name = "manual_decision")
    private String manualDecision; // APPROVED, REJECTED, REQUEST_RESUBMISSION

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_officer_id")
    private User assignedOfficer;

    @Column(name = "decision_notes", columnDefinition = "TEXT")
    private String decisionNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public VerificationRequest() {
    }

    public VerificationRequest(User user) {
        this.user = user;
        this.status = "INITIATED";
        this.autoDecision = "PENDING";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getOverallRiskScore() {
        return overallRiskScore;
    }

    public void setOverallRiskScore(Double overallRiskScore) {
        this.overallRiskScore = overallRiskScore;
    }

    public String getAutoDecision() {
        return autoDecision;
    }

    public void setAutoDecision(String autoDecision) {
        this.autoDecision = autoDecision;
    }

    public String getManualDecision() {
        return manualDecision;
    }

    public void setManualDecision(String manualDecision) {
        this.manualDecision = manualDecision;
    }

    public User getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(User assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public String getDecisionNotes() {
        return decisionNotes;
    }

    public void setDecisionNotes(String decisionNotes) {
        this.decisionNotes = decisionNotes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
