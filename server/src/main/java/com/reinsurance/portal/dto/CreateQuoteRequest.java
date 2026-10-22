package com.reinsurance.portal.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateQuoteRequest(
    @NotNull(message = "Share offered percentage is required")
    @DecimalMin(value = "0.01", message = "Share offered must be at least 0.01%")
    @DecimalMax(value = "100.00", message = "Share offered cannot exceed 100.00%")
    BigDecimal shareOfferedPercentage,

    @NotNull(message = "Ceding commission percentage is required")
    @DecimalMin(value = "0.00", message = "Ceding commission must be at least 0.00%")
    @DecimalMax(value = "100.00", message = "Ceding commission cannot exceed 100.00%")
    BigDecimal cedingCommissionPercentage,

    @NotNull(message = "Calculated reinsurance premium is required")
    @Positive(message = "Calculated reinsurance premium must be positive")
    BigDecimal calculatedReinsurancePremium,

    String subjectivities,
    String conditions,
    String exclusions
) {}
