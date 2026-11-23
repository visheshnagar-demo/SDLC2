package com.identiverify.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class VerificationResponse {

    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userFullName;
    private String status;
    private Double overallRiskScore;
    private String autoDecision;
    private String manualDecision;
    private UUID assignedOfficerId;
    private String decisionNotes;
    private Instant createdAt;
    private Instant updatedAt;
    private List<DocumentUploadResponse> documents;
    private BiometricCheckResponse biometricCheck;

    public VerificationResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
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

    public UUID getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(UUID assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
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

    public List<DocumentUploadResponse> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentUploadResponse> documents) {
        this.documents = documents;
    }

    public BiometricCheckResponse getBiometricCheck() {
        return biometricCheck;
    }

    public void setBiometricCheck(BiometricCheckResponse biometricCheck) {
        this.biometricCheck = biometricCheck;
    }
}
