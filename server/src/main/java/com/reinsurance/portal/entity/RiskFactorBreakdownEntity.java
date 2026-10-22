package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "risk_factor_breakdowns")
public class RiskFactorBreakdownEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private SubmissionEntity submission;

    @Column(nullable = false)
    private String factorCategory;

    @Column(nullable = false)
    private String factorName;

    @Column(nullable = false)
    private Integer scoreAwarded;

    @Column(nullable = false)
    private Integer maxScore;

    @Column(columnDefinition = "TEXT")
    private String evaluationNotes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

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

    public String getEvaluationNotes() { return evaluationNotes; }
    public void setEvaluationNotes(String evaluationNotes) { this.evaluationNotes = evaluationNotes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
