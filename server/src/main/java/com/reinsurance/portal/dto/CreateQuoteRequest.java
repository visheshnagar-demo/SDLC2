package com.reinsurance.portal.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateQuoteRequest(
    @NotNull(message = "Share offered percentage is required")
    @DecimalMin(value = "0.01", message = "Share offered percentage must be greater than 0")
    @DecimalMax(value = "100.00", message = "Share offered percentage cannot exceed 100")
    BigDecimal shareOfferedPercentage,

    @NotNull(message = "Ceding commission percentage is required")
    @DecimalMin(value = "0.00", message = "Ceding commission percentage cannot be negative")
    @DecimalMax(value = "100.00", message = "Ceding commission percentage cannot exceed 100")
    BigDecimal cedingCommissionPercentage,

    BigDecimal calculatedReinsurancePremium,

    String subjectivities,
    String conditions,
    String exclusions
) {}
