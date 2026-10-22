package com.reinsurance.portal.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RiskScoreResponse(
    UUID submissionId,
    int compositeScore,
    String riskTier, // LOW, MEDIUM, HIGH, ELEVATED
    List<FactorScoreItem> factorBreakdown,
    Instant calculatedAt
) {
    public record FactorScoreItem(
        String factorCategory,
        String factorName,
        int scoreAwarded,
        int maxScore,
        String evalNotes
    ) {}
}
