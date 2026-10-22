package com.reinsurance.portal.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RiskScoreResponse(
    UUID submissionId,
    int compositeScore,
    String riskTier,
    List<FactorScoreItem> factorBreakdown,
    Instant calculatedAt
) {
    public record FactorScoreItem(
        String factorCategory,
        String factorName,
        int pointsEarned,
        int maxPoints,
        String evaluationNotes
    ) {}
}
