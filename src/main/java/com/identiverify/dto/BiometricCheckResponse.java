package com.identiverify.dto;

import java.util.UUID;

public class BiometricCheckResponse {

    private UUID checkId;
    private UUID verificationId;
    private Double livenessScore;
    private String livenessStatus; // PASSED, FAILED
    private Double matchConfidenceScore;
    private String matchStatus; // MATCHED, MISMATCH
    private Double overallRiskScore;
    private String verificationStatus; // AUTO_APPROVED, FLAGGED, REJECTED

    public BiometricCheckResponse() {
    }

    public BiometricCheckResponse(UUID checkId, UUID verificationId, Double livenessScore,
                                  String livenessStatus, Double matchConfidenceScore,
                                  String matchStatus, Double overallRiskScore, String verificationStatus) {
        this.checkId = checkId;
        this.verificationId = verificationId;
        this.livenessScore = livenessScore;
        this.livenessStatus = livenessStatus;
        this.matchConfidenceScore = matchConfidenceScore;
        this.matchStatus = matchStatus;
        this.overallRiskScore = overallRiskScore;
        this.verificationStatus = verificationStatus;
    }

    public UUID getCheckId() {
        return checkId;
    }

    public void setCheckId(UUID checkId) {
        this.checkId = checkId;
    }

    public UUID getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(UUID verificationId) {
        this.verificationId = verificationId;
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

    public Double getOverallRiskScore() {
        return overallRiskScore;
    }

    public void setOverallRiskScore(Double overallRiskScore) {
        this.overallRiskScore = overallRiskScore;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
