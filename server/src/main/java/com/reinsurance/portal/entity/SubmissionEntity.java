package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "submissions", indexes = {
    @Index(name = "idx_sub_status_lob", columnList = "status, line_of_business"),
    @Index(name = "idx_sub_created_at", columnList = "created_at"),
    @Index(name = "idx_sub_cedent", columnList = "ceding_company_name")
})
public class SubmissionEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "ceding_company_name", nullable = false)
    private String cedingCompanyName;

    @Column(name = "insured_name", nullable = false)
    private String insuredName;

    @Column(name = "line_of_business", nullable = false)
    private String lineOfBusiness;

    @Column(name = "policy_limit", precision = 19, scale = 2, nullable = false)
    private BigDecimal policyLimit;

    @Column(name = "attachment_point", precision = 19, scale = 2, nullable = false)
    private BigDecimal attachmentPoint;

    @Column(name = "retention", precision = 19, scale = 2, nullable = false)
    private BigDecimal retention;

    @Column(name = "gross_premium", precision = 19, scale = 2, nullable = false)
    private BigDecimal grossPremium;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "industry", nullable = false)
    private String industry;

    @Column(name = "revenue_band", nullable = false)
    private String revenueBand;

    @Column(name = "jurisdiction", nullable = false)
    private String jurisdiction;

    @Column(name = "status", nullable = false)
    private String status; // RECEIVED, IN_REVIEW, INFO_REQUESTED, QUOTED, BOUND, DECLINED, REFERRED_TO_MANAGER

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "risk_tier")
    private String riskTier; // LOW, MEDIUM, HIGH, ELEVATED

    @Column(name = "is_referred", nullable = false)
    private boolean isReferred = false;

    @Column(name = "assigned_underwriter_id")
    private String assignedUnderwriterId;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Lob
    @Column(name = "risk_attributes_json")
    private String riskAttributesJson;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SubmissionDocumentEntity> documents = new ArrayList<>();

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RiskFactorBreakdownEntity> riskFactors = new ArrayList<>();

    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private QuoteEntity quote;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UnderwritingDecisionEntity> decisions = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
        if (this.status == null) {
            this.status = "RECEIVED";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public SubmissionEntity() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCedingCompanyName() { return cedingCompanyName; }
    public void setCedingCompanyName(String cedingCompanyName) { this.cedingCompanyName = cedingCompanyName; }

    public String getInsuredName() { return insuredName; }
    public void setInsuredName(String insuredName) { this.insuredName = insuredName; }

    public String getLineOfBusiness() { return lineOfBusiness; }
    public void setLineOfBusiness(String lineOfBusiness) { this.lineOfBusiness = lineOfBusiness; }

    public BigDecimal getPolicyLimit() { return policyLimit; }
    public void setPolicyLimit(BigDecimal policyLimit) { this.policyLimit = policyLimit; }

    public BigDecimal getAttachmentPoint() { return attachmentPoint; }
    public void setAttachmentPoint(BigDecimal attachmentPoint) { this.attachmentPoint = attachmentPoint; }

    public BigDecimal getRetention() { return retention; }
    public void setRetention(BigDecimal retention) { this.retention = retention; }

    public BigDecimal getGrossPremium() { return grossPremium; }
    public void setGrossPremium(BigDecimal grossPremium) { this.grossPremium = grossPremium; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getRevenueBand() { return revenueBand; }
    public void setRevenueBand(String revenueBand) { this.revenueBand = revenueBand; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskTier() { return riskTier; }
    public void setRiskTier(String riskTier) { this.riskTier = riskTier; }

    public boolean isReferred() { return isReferred; }
    public void setReferred(boolean referred) { isReferred = referred; }

    public String getAssignedUnderwriterId() { return assignedUnderwriterId; }
    public void setAssignedUnderwriterId(String assignedUnderwriterId) { this.assignedUnderwriterId = assignedUnderwriterId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getRiskAttributesJson() { return riskAttributesJson; }
    public void setRiskAttributesJson(String riskAttributesJson) { this.riskAttributesJson = riskAttributesJson; }

    public List<SubmissionDocumentEntity> getDocuments() { return documents; }
    public void setDocuments(List<SubmissionDocumentEntity> documents) { this.documents = documents; }

    public List<RiskFactorBreakdownEntity> getRiskFactors() { return riskFactors; }
    public void setRiskFactors(List<RiskFactorBreakdownEntity> riskFactors) { this.riskFactors = riskFactors; }

    public QuoteEntity getQuote() { return quote; }
    public void setQuote(QuoteEntity quote) { this.quote = quote; }

    public List<UnderwritingDecisionEntity> getDecisions() { return decisions; }
    public void setDecisions(List<UnderwritingDecisionEntity> decisions) { this.decisions = decisions; }
}
