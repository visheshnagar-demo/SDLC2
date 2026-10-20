package com.genre.qtb.dto;

import com.genre.qtb.model.LayerStructure;
import com.genre.qtb.model.QuoteEntity;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class QuoteResponse {
    private UUID id;
    private String quoteNumber;
    private String insuredName;
    private String lineOfBusiness;
    private BigDecimal sumInsured;
    private BigDecimal deductible;
    private String structureType;
    private BigDecimal attachmentPoint;
    private BigDecimal quotedPremium;
    private Double rateOnLine;
    private Double cedingCommission;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private List<LayerStructure> layers;

    public QuoteResponse() {
    }

    public static QuoteResponse fromEntity(QuoteEntity entity, List<LayerStructure> layers) {
        QuoteResponse response = new QuoteResponse();
        response.setId(entity.getId());
        response.setQuoteNumber(entity.getQuoteNumber());
        response.setInsuredName(entity.getInsuredName());
        response.setLineOfBusiness(entity.getLineOfBusiness());
        response.setSumInsured(entity.getSumInsured());
        response.setDeductible(entity.getDeductible());
        response.setStructureType(entity.getStructureType());
        response.setAttachmentPoint(entity.getAttachmentPoint());
        response.setQuotedPremium(entity.getQuotedPremium());
        response.setRateOnLine(entity.getRateOnLine());
        response.setCedingCommission(entity.getCedingCommission());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setLayers(layers);
        return response;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getQuoteNumber() {
        return quoteNumber;
    }

    public void setQuoteNumber(String quoteNumber) {
        this.quoteNumber = quoteNumber;
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

    public BigDecimal getQuotedPremium() {
        return quotedPremium;
    }

    public void setQuotedPremium(BigDecimal quotedPremium) {
        this.quotedPremium = quotedPremium;
    }

    public Double getRateOnLine() {
        return rateOnLine;
    }

    public void setRateOnLine(Double rateOnLine) {
        this.rateOnLine = rateOnLine;
    }

    public Double getCedingCommission() {
        return cedingCommission;
    }

    public void setCedingCommission(Double cedingCommission) {
        this.cedingCommission = cedingCommission;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<LayerStructure> getLayers() {
        return layers;
    }

    public void setLayers(List<LayerStructure> layers) {
        this.layers = layers;
    }
}
