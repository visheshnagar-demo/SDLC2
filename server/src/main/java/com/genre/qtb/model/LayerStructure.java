package com.genre.qtb.model;

import java.math.BigDecimal;

public class LayerStructure {
    private Integer layerNumber;
    private BigDecimal attachment;
    private BigDecimal limit;
    private Double genreSharePercentage;

    public LayerStructure() {
    }

    public LayerStructure(Integer layerNumber, BigDecimal attachment, BigDecimal limit, Double genreSharePercentage) {
        this.layerNumber = layerNumber;
        this.attachment = attachment;
        this.limit = limit;
        this.genreSharePercentage = genreSharePercentage;
    }

    public Integer getLayerNumber() {
        return layerNumber;
    }

    public void setLayerNumber(Integer layerNumber) {
        this.layerNumber = layerNumber;
    }

    public BigDecimal getAttachment() {
        return attachment;
    }

    public void setAttachment(BigDecimal attachment) {
        this.attachment = attachment;
    }

    public BigDecimal getLimit() {
        return limit;
    }

    public void setLimit(BigDecimal limit) {
        this.limit = limit;
    }

    public Double getGenreSharePercentage() {
        return genreSharePercentage;
    }

    public void setGenreSharePercentage(Double genreSharePercentage) {
        this.genreSharePercentage = genreSharePercentage;
    }
}
