package com.genre.qtb.dto;

import jakarta.validation.constraints.NotBlank;

public class UnderwritingDecisionRequest {

    @NotBlank(message = "Decision is required (e.g. APPROVED, REFERRED, DECLINED)")
    private String decision;

    private String underwriterId;
    private String reviewNotes;

    public UnderwritingDecisionRequest() {
    }

    public UnderwritingDecisionRequest(String decision, String underwriterId, String reviewNotes) {
        this.decision = decision;
        this.underwriterId = underwriterId;
        this.reviewNotes = reviewNotes;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getUnderwriterId() {
        return underwriterId;
    }

    public void setUnderwriterId(String underwriterId) {
        this.underwriterId = underwriterId;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
}
