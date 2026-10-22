package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "submissions")
public class SubmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String cedingCompanyName;

    @Column(nullable = false)
    private String insuredName;

    @Column(nullable = false)
    private String lineOfBusiness;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal policyLimit;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal attachmentPoint;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal retention;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal grossPremium;

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private String industry;

    @Column(nullable = false)
    private String revenueBand;

    @Column(nullable = false)
    private String jurisdiction;

    @Column(nullable = false)
    private String status = "RECEIVED";

    private Integer riskScore;

    private String riskTier;

    private Boolean isReferred = false;

    private UUID assignedUnderwriterId;

    private String createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @Lob
    @Column(columnDefinition = "TEXT")
    private String riskAttributesJson;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SubmissionDocumentEntity> documents = new ArrayList<>();

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RiskFactorBreakdownEntity> factorBreakdowns = new ArrayList<>();

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<QuoteEntity> quotes = new ArrayList<>();

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UnderwritingDecisionEntity> decisions = new ArrayList<>();

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AuditLogEntity> auditLogs = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
        if (status == null) status = "RECEIVED";
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

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

    public Boolean getIsReferred() { return isReferred; }
    public void setIsReferred(Boolean referred) { isReferred = referred; }

    public UUID getAssignedUnderwriterId() { return assignedUnderwriterId; }
    public void setAssignedUnderwriterId(UUID assignedUnderwriterId) { this.assignedUnderwriterId = assignedUnderwriterId; }

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

    public List<RiskFactorBreakdownEntity> getFactorBreakdowns() { return factorBreakdowns; }
    public void setFactorBreakdowns(List<RiskFactorBreakdownEntity> factorBreakdowns) { this.factorBreakdowns = factorBreakdowns; }

    public List<QuoteEntity> getQuotes() { return quotes; }
    public void setQuotes(List<QuoteEntity> quotes) { this.quotes = quotes; }

    public List<UnderwritingDecisionEntity> getDecisions() { return decisions; }
    public void setDecisions(List<UnderwritingDecisionEntity> decisions) { this.decisions = decisions; }

    public List<AuditLogEntity> getAuditLogs() { return auditLogs; }
    public void setAuditLogs(List<AuditLogEntity> auditLogs) { this.auditLogs = auditLogs; }
}
