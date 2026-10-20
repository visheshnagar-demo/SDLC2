package com.genre.qtb.dto;

import com.genre.qtb.model.LayerStructure;
import com.genre.qtb.model.QuoteEntity;
import com.genre.qtb.model.RiskExposureEntity;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class RiskExposureResponse {
    private UUID id;
    private UUID quoteId;
    private String quoteNumber;
    private String insuredName;
    private String lineOfBusiness;
    private BigDecimal totalExposure;
    private BigDecimal probableMaximumLoss;
    private Integer catRiskScore;
    private String underwritingDecision;
    private String underwriterNotes;
    private List<LayerStructure> layers;

    public RiskExposureResponse() {
    }

    public static RiskExposureResponse fromEntity(RiskExposureEntity entity, QuoteEntity quote) {
        RiskExposureResponse response = new RiskExposureResponse();
        response.setId(entity.getId());
        response.setQuoteId(entity.getQuoteId());
        response.setTotalExposure(entity.getTotalExposure());
        response.setProbableMaximumLoss(entity.getProbableMaximumLoss());
        response.setCatRiskScore(entity.getCatRiskScore());
        response.setUnderwritingDecision(entity.getUnderwritingDecision());
        response.setUnderwriterNotes(entity.getUnderwriterNotes());
        response.setLayers(entity.getLayers());

        if (quote != null) {
            response.setQuoteNumber(quote.getQuoteNumber());
            response.setInsuredName(quote.getInsuredName());
            response.setLineOfBusiness(quote.getLineOfBusiness());
        }
        return response;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(UUID quoteId) {
        this.quoteId = quoteId;
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

    public BigDecimal getTotalExposure() {
        return totalExposure;
    }

    public void setTotalExposure(BigDecimal totalExposure) {
        this.totalExposure = totalExposure;
    }

    public BigDecimal getProbableMaximumLoss() {
        return probableMaximumLoss;
    }

    public void setProbableMaximumLoss(BigDecimal probableMaximumLoss) {
        this.probableMaximumLoss = probableMaximumLoss;
    }

    public Integer getCatRiskScore() {
        return catRiskScore;
    }

    public void setCatRiskScore(Integer catRiskScore) {
        this.catRiskScore = catRiskScore;
    }

    public String getUnderwritingDecision() {
        return underwritingDecision;
    }

    public void setUnderwritingDecision(String underwritingDecision) {
        this.underwritingDecision = underwritingDecision;
    }

    public String getUnderwriterNotes() {
        return underwriterNotes;
    }

    public void setUnderwriterNotes(String underwriterNotes) {
        this.underwriterNotes = underwriterNotes;
    }

    public List<LayerStructure> getLayers() {
        return layers;
    }

    public void setLayers(List<LayerStructure> layers) {
        this.layers = layers;
    }
}
