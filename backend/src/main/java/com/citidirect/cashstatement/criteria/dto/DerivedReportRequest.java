package com.citidirect.cashstatement.criteria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DerivedReportRequest {

    @NotBlank(message = "Derived Report Name is required")
    private String derivedReportName;

    private String baseReportName = "Account Statement – Comprehensive";

    @NotBlank(message = "Format is required")
    private String format = "Adobe(PDF) requires Acrobat Reader (5.0 or higher)";

    private String deliveryOptionId;
    private String designatedOwner;
    private String share = "PRIVATE"; // PRIVATE or PUBLIC
    private boolean favorite = false;

    @NotNull(message = "Criteria payload is required")
    private CriteriaPayload criteria;

    public DerivedReportRequest() {}

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

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getDeliveryOptionId() {
        return deliveryOptionId;
    }

    public void setDeliveryOptionId(String deliveryOptionId) {
        this.deliveryOptionId = deliveryOptionId;
    }

    public String getDesignatedOwner() {
        return designatedOwner;
    }

    public void setDesignatedOwner(String designatedOwner) {
        this.designatedOwner = designatedOwner;
    }

    public String getShare() {
        return share;
    }

    public void setShare(String share) {
        this.share = share;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }

    public CriteriaPayload getCriteria() {
        return criteria;
    }

    public void setCriteria(CriteriaPayload criteria) {
        this.criteria = criteria;
    }
}
