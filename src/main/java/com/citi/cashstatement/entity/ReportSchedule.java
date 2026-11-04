package com.citi.cashstatement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "report_schedules")
@Getter
@Setter
@NoArgsConstructor
public class ReportSchedule {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "schedule_name", nullable = false, length = 128)
    private String scheduleName;

    @Column(name = "template_id", nullable = false, length = 64)
    private String templateId;

    @Column(name = "criteria_json", nullable = false, columnDefinition = "TEXT")
    private String criteriaJson;

    @Column(nullable = false, length = 16)
    private String frequency; // DAILY, WEEKLY, MONTHLY

    @Column(name = "cron_expression", nullable = false, length = 64)
    private String cronExpression;

    @Column(name = "export_format", nullable = false, length = 10)
    private String exportFormat; // PDF, EXCEL, CSV

    @Column(name = "delivery_config", nullable = false, columnDefinition = "TEXT")
    private String deliveryConfig;

    @Column(nullable = false, length = 24)
    private String status; // DRAFT, PENDING_APPROVAL, ACTIVE, REJECTED, INACTIVE

    @Column(name = "created_by", nullable = false, length = 64)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = OffsetDateTime.now();
        }
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
