package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "risk_factor_breakdowns", indexes = {
    @Index(name = "idx_rfb_sub_id", columnList = "submission_id")
})
public class RiskFactorBreakdownEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private SubmissionEntity submission;

    @Column(name = "factor_category", nullable = false)
    private String factorCategory;

    @Column(name = "factor_name", nullable = false)
    private String factorName;

    @Column(name = "score_awarded", nullable = false)
    private Integer scoreAwarded;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "eval_notes")
    private String evalNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public RiskFactorBreakdownEntity() {}

    public RiskFactorBreakdownEntity(SubmissionEntity submission, String factorCategory, String factorName,
                                      Integer scoreAwarded, Integer maxScore, String evalNotes) {
        this.submission = submission;
        this.factorCategory = factorCategory;
        this.factorName = factorName;
        this.scoreAwarded = scoreAwarded;
        this.maxScore = maxScore;
        this.evalNotes = evalNotes;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public SubmissionEntity getSubmission() { return submission; }
    public void setSubmission(SubmissionEntity submission) { this.submission = submission; }

    public String getFactorCategory() { return factorCategory; }
    public void setFactorCategory(String factorCategory) { this.factorCategory = factorCategory; }

    public String getFactorName() { return factorName; }
    public void setFactorName(String factorName) { this.factorName = factorName; }

    public Integer getScoreAwarded() { return scoreAwarded; }
    public void setScoreAwarded(Integer scoreAwarded) { this.scoreAwarded = scoreAwarded; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public String getEvalNotes() { return evalNotes; }
    public void setEvalNotes(String evalNotes) { this.evalNotes = evalNotes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
