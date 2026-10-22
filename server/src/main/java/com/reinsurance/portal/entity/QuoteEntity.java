package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quotes", indexes = {
    @Index(name = "idx_quote_sub_id", columnList = "submission_id")
})
public class QuoteEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private SubmissionEntity submission;

    @Column(name = "share_offered_percentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal shareOfferedPercentage;

    @Column(name = "ceding_commission_percentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal cedingCommissionPercentage;

    @Column(name = "calculated_reinsurance_premium", precision = 19, scale = 2, nullable = false)
    private BigDecimal calculatedReinsurancePremium;

    @Column(name = "net_reinsurance_premium", precision = 19, scale = 2)
    private BigDecimal netReinsurancePremium;

    @Lob
    @Column(name = "subjectivities")
    private String subjectivities;

    @Lob
    @Column(name = "conditions")
    private String conditions;

    @Lob
    @Column(name = "exclusions")
    private String exclusions;

    @Column(name = "status", nullable = false)
    private String status; // DRAFT, ISSUED, ACCEPTED, DECLINED

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

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
            this.status = "ISSUED";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public QuoteEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public SubmissionEntity getSubmission() { return submission; }
    public void setSubmission(SubmissionEntity submission) { this.submission = submission; }

    public BigDecimal getShareOfferedPercentage() { return shareOfferedPercentage; }
    public void setShareOfferedPercentage(BigDecimal shareOfferedPercentage) { this.shareOfferedPercentage = shareOfferedPercentage; }

    public BigDecimal getCedingCommissionPercentage() { return cedingCommissionPercentage; }
    public void setCedingCommissionPercentage(BigDecimal cedingCommissionPercentage) { this.cedingCommissionPercentage = cedingCommissionPercentage; }

    public BigDecimal getCalculatedReinsurancePremium() { return calculatedReinsurancePremium; }
    public void setCalculatedReinsurancePremium(BigDecimal calculatedReinsurancePremium) { this.calculatedReinsurancePremium = calculatedReinsurancePremium; }

    public BigDecimal getNetReinsurancePremium() { return netReinsurancePremium; }
    public void setNetReinsurancePremium(BigDecimal netReinsurancePremium) { this.netReinsurancePremium = netReinsurancePremium; }

    public String getSubjectivities() { return subjectivities; }
    public void setSubjectivities(String subjectivities) { this.subjectivities = subjectivities; }

    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }

    public String getExclusions() { return exclusions; }
    public void setExclusions(String exclusions) { this.exclusions = exclusions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
