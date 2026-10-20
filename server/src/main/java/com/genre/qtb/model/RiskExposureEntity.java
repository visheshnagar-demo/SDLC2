package com.genre.qtb.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RiskExposureEntity {
    private UUID id;
    private UUID quoteId;
    private BigDecimal totalExposure;
    private BigDecimal probableMaximumLoss;
    private Integer catRiskScore;
    private String underwritingDecision;
    private String underwriterNotes;
    private List<LayerStructure> layers = new ArrayList<>();

    public RiskExposureEntity() {
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
