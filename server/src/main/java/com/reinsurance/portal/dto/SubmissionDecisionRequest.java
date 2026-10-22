package com.reinsurance.portal.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record SubmissionDecisionRequest(
    @NotBlank(message = "Target status is required")
    String targetStatus, // IN_REVIEW, INFO_REQUESTED, QUOTED, BOUND, DECLINED, REFERRED_TO_MANAGER

    String declineReason, // Mandatory when targetStatus == DECLINED
    String notes,
    BigDecimal approvedLimit
) {}
