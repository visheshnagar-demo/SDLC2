package com.reinsurance.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record CreateSubmissionRequest(
    @NotBlank(message = "Ceding company name is required") String cedingCompanyName,
    @NotBlank(message = "Insured name is required") String insuredName,
    @NotBlank(message = "Line of business is required") String lineOfBusiness,
    @NotNull(message = "Policy limit is required") @Positive(message = "Policy limit must be positive") BigDecimal policyLimit,
    @NotNull(message = "Attachment point is required") BigDecimal attachmentPoint,
    @NotNull(message = "Retention is required") @PositiveOrZero(message = "Retention must be zero or positive") BigDecimal retention,
    @NotNull(message = "Gross premium is required") @Positive(message = "Gross premium must be positive") BigDecimal grossPremium,
    @NotNull(message = "Effective date is required") LocalDate effectiveDate,
    @NotNull(message = "Expiry date is required") LocalDate expiryDate,
    @NotBlank(message = "Industry is required") String industry,
    @NotBlank(message = "Revenue band is required") String revenueBand,
    @NotBlank(message = "Jurisdiction is required") String jurisdiction,
    Map<String, Object> riskAttributes
) {}
