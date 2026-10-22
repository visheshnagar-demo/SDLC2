package com.reinsurance.portal.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record SubmissionResponse(
    UUID id,
    String cedingCompanyName,
    String insuredName,
    String lineOfBusiness,
    BigDecimal policyLimit,
    BigDecimal attachmentPoint,
    BigDecimal retention,
    BigDecimal grossPremium,
    LocalDate effectiveDate,
    LocalDate expiryDate,
    String industry,
    String revenueBand,
    String jurisdiction,
    String status,
    Integer riskScore,
    String riskTier,
    Boolean isReferred,
    UUID assignedUnderwriterId,
    String createdBy,
    Instant createdAt,
    Instant updatedAt,
    Map<String, Object> riskAttributes,
    List<RiskScoreResponse.FactorScoreItem> factorBreakdown,
    List<DocumentUploadResponse> documents,
    String slaIndicator,
    Long ageHours
) {}
