package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quotes")
public class QuoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private SubmissionEntity submission;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal shareOfferedPercentage;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal cedingCommissionPercentage;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal calculatedReinsurancePremium;

    @Column(columnDefinition = "TEXT")
    private String subjectivities;

    @Column(columnDefinition = "TEXT")
    private String conditions;

    @Column(columnDefinition = "TEXT")
    private String exclusions;

    @Column(nullable = false)
    private String status = "ISSUED";

    private String createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

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
}
