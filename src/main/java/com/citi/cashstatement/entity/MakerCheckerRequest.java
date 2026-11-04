package com.citi.cashstatement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "maker_checker_requests")
@Getter
@Setter
@NoArgsConstructor
public class MakerCheckerRequest {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "resource_type", nullable = false, length = 32)
    private String resourceType; // REPORT_SCHEDULE, EXPORT_REQUEST

    @Column(name = "resource_id", nullable = false, length = 36)
    private String resourceId;

    @Column(name = "maker_id", nullable = false, length = 64)
    private String makerId;

    @Column(name = "checker_id", length = 64)
    private String checkerId;

    @Column(nullable = false, length = 24)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "maker_comments", columnDefinition = "TEXT")
    private String makerComments;

    @Column(name = "checker_comments", columnDefinition = "TEXT")
    private String checkerComments;

    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @PrePersist
    public void onPrePersist() {
        if (submittedAt == null) {
            submittedAt = OffsetDateTime.now();
        }
    }
}
