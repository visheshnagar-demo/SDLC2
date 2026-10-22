package com.reinsurance.portal.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmissionDecisionRequest(
    @NotBlank(message = "Target status is required") String targetStatus,
    String declineReason,
    String underwriterNotes
) {}
