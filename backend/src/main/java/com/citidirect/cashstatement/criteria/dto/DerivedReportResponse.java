package com.citidirect.cashstatement.criteria.dto;

import java.time.OffsetDateTime;

public class DerivedReportResponse {

    private String id;
    private String derivedReportName;
    private String baseReportName;
    private String ownerUsername;
    private String format;
    private boolean sharedPublic;
    private boolean favorite;
    private String deliveryOptionId;
    private CriteriaPayload criteria;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public DerivedReportResponse() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDerivedReportName() {
        return derivedReportName;
    }

    public void setDerivedReportName(String derivedReportName) {
        this.derivedReportName = derivedReportName;
    }

    public String getBaseReportName() {
        return baseReportName;
    }

    public void setBaseReportName(String baseReportName) {
        this.baseReportName = baseReportName;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public boolean isSharedPublic() {
        return sharedPublic;
    }

    public void setSharedPublic(boolean sharedPublic) {
        this.sharedPublic = sharedPublic;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }

    public String getDeliveryOptionId() {
        return deliveryOptionId;
    }

    public void setDeliveryOptionId(String deliveryOptionId) {
        this.deliveryOptionId = deliveryOptionId;
    }

    public CriteriaPayload getCriteria() {
        return criteria;
    }

    public void setCriteria(CriteriaPayload criteria) {
        this.criteria = criteria;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
