package com.identiverify.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "biometric_checks")
public class BiometricCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_id", nullable = false)
    private VerificationRequest verificationRequest;

    @Column(name = "liveness_score")
    private Double livenessScore;

    @Column(name = "liveness_status")
    private String livenessStatus; // PASSED, FAILED

    @Column(name = "match_confidence_score")
    private Double matchConfidenceScore;

    @Column(name = "match_status")
    private String matchStatus; // MATCHED, MISMATCH

    @Column(name = "selfie_storage_path")
    private String selfieStoragePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public BiometricCheck() {
    }

    public BiometricCheck(VerificationRequest verificationRequest, Double livenessScore, String livenessStatus,
                          Double matchConfidenceScore, String matchStatus) {
        this.verificationRequest = verificationRequest;
        this.livenessScore = livenessScore;
        this.livenessStatus = livenessStatus;
        this.matchConfidenceScore = matchConfidenceScore;
        this.matchStatus = matchStatus;
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

    public VerificationRequest getVerificationRequest() {
        return verificationRequest;
    }

    public void setVerificationRequest(VerificationRequest verificationRequest) {
        this.verificationRequest = verificationRequest;
    }

    public Double getLivenessScore() {
        return livenessScore;
    }

    public void setLivenessScore(Double livenessScore) {
        this.livenessScore = livenessScore;
    }

    public String getLivenessStatus() {
        return livenessStatus;
    }

    public void setLivenessStatus(String livenessStatus) {
        this.livenessStatus = livenessStatus;
    }

    public Double getMatchConfidenceScore() {
        return matchConfidenceScore;
    }

    public void setMatchConfidenceScore(Double matchConfidenceScore) {
        this.matchConfidenceScore = matchConfidenceScore;
    }

    public String getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(String matchStatus) {
        this.matchStatus = matchStatus;
    }

    public String getSelfieStoragePath() {
        return selfieStoragePath;
    }

    public void setSelfieStoragePath(String selfieStoragePath) {
        this.selfieStoragePath = selfieStoragePath;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
