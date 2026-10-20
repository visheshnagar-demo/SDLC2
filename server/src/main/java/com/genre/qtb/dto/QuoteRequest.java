package com.genre.qtb.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class QuoteRequest {

    @NotBlank(message = "Insured name is required")
    private String insuredName;

    @NotBlank(message = "Line of business is required")
    private String lineOfBusiness;

    @NotNull(message = "Sum insured is required")
    @DecimalMin(value = "0.01", message = "Sum insured must be greater than zero")
    private BigDecimal sumInsured;

    @NotNull(message = "Deductible is required")
    private BigDecimal deductible;

    @NotBlank(message = "Structure type is required")
    private String structureType;

    private BigDecimal attachmentPoint;
    private Double targetRate;
    private Double cedingCommission;

    public QuoteRequest() {
    }

    public String getInsuredName() {
        return insuredName;
    }

    public void setInsuredName(String insuredName) {
        this.insuredName = insuredName;
    }

    public String getLineOfBusiness() {
        return lineOfBusiness;
    }

    public void setLineOfBusiness(String lineOfBusiness) {
        this.lineOfBusiness = lineOfBusiness;
    }

    public BigDecimal getSumInsured() {
        return sumInsured;
    }

    public void setSumInsured(BigDecimal sumInsured) {
        this.sumInsured = sumInsured;
    }

    public BigDecimal getDeductible() {
        return deductible;
    }

    public void setDeductible(BigDecimal deductible) {
        this.deductible = deductible;
    }

    public String getStructureType() {
        return structureType;
    }

    public void setStructureType(String structureType) {
        this.structureType = structureType;
    }

    public BigDecimal getAttachmentPoint() {
        return attachmentPoint;
    }

    public void setAttachmentPoint(BigDecimal attachmentPoint) {
        this.attachmentPoint = attachmentPoint;
    }

    public Double getTargetRate() {
        return targetRate;
    }

    public void setTargetRate(Double targetRate) {
        this.targetRate = targetRate;
    }

    public Double getCedingCommission() {
        return cedingCommission;
    }

    public void setCedingCommission(Double cedingCommission) {
        this.cedingCommission = cedingCommission;
    }
}
