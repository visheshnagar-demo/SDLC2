package com.reinsurance.portal.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record QuoteResponse(
    UUID id,
    UUID submissionId,
    BigDecimal shareOfferedPercentage,
    BigDecimal cedingCommissionPercentage,
    BigDecimal calculatedReinsurancePremium,
    BigDecimal netReinsurancePremium,
    String subjectivities,
    String conditions,
    String exclusions,
    String status,
    String createdBy,
    Instant createdAt,
    Instant updatedAt
) {}
