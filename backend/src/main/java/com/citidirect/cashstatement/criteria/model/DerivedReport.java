package com.citidirect.cashstatement.criteria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "derived_reports")
public class DerivedReport {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "derived_report_name", nullable = false, unique = true, length = 100)
    private String derivedReportName;

    @Column(name = "base_report_name", nullable = false, length = 100)
    private String baseReportName = "Account Statement – Comprehensive";

    @Column(name = "owner_username", nullable = false, length = 50)
    private String ownerUsername;

    @Column(name = "format", nullable = false, length = 50)
    private String format;

    @Column(name = "is_shared_public", nullable = false)
    private boolean sharedPublic = false;

    @Column(name = "is_favorite", nullable = false)
    private boolean favorite = false;

    @Column(name = "delivery_option_id", length = 36)
    private String deliveryOptionId;

    @Column(name = "criteria_payload", nullable = false, columnDefinition = "TEXT")
    private String criteriaPayload;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public DerivedReport() {}

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

    public String getCriteriaPayload() {
        return criteriaPayload;
    }

    public void setCriteriaPayload(String criteriaPayload) {
        this.criteriaPayload = criteriaPayload;
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
