package com.identiverify.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AdjudicationRequest {

    @NotNull(message = "Verification ID is required")
    private UUID verificationId;

    @NotBlank(message = "Manual decision is required (APPROVED, REJECTED, REQUEST_RESUBMISSION)")
    private String manualDecision;

    private String decisionNotes;

    public AdjudicationRequest() {
    }

    public AdjudicationRequest(UUID verificationId, String manualDecision, String decisionNotes) {
        this.verificationId = verificationId;
        this.manualDecision = manualDecision;
        this.decisionNotes = decisionNotes;
    }

    public UUID getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(UUID verificationId) {
        this.verificationId = verificationId;
    }

    public String getManualDecision() {
        return manualDecision;
    }

    public void setManualDecision(String manualDecision) {
        this.manualDecision = manualDecision;
    }

    public String getDecisionNotes() {
        return decisionNotes;
    }

    public void setDecisionNotes(String decisionNotes) {
        this.decisionNotes = decisionNotes;
    }
}
