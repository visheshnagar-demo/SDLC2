package com.reinsurance.portal.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public record DashboardMetricsResponse(
    long totalSubmissions,
    Map<String, Long> submissionsByLine,
    Map<String, Long> submissionsByStatus,
    BigDecimal quoteToBindRatioPercentage,
    BigDecimal averageTurnaroundHours,
    Map<String, BigDecimal> totalExposedLimitByLine,
    long pendingReferralCount,
    Instant generatedAt
) {}
