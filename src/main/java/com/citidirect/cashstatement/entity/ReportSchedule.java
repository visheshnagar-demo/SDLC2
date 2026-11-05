package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_schedules")
public class ReportSchedule {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "criteria_id", length = 64)
    private String criteriaId;

    @Column(name = "frequency", nullable = false, length = 50)
    private String frequency; // DAILY, WEEKLY, MONTHLY, CUSTOM

    @Column(name = "cron_expression", length = 100)
    private String cronExpression;

    @Column(name = "execution_time_utc", length = 50)
    private String executionTimeUtc;

    @Column(name = "export_format", nullable = false, length = 50)
    private String exportFormat; // PDF, EXCEL, CSV, SWIFT_MT940

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING_APPROVAL"; // ACTIVE, PAUSED, PENDING_APPROVAL, REJECTED, REVOKED

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ReportSchedule() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCriteriaId() { return criteriaId; }
    public void setCriteriaId(String criteriaId) { this.criteriaId = criteriaId; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }

    public String getExecutionTimeUtc() { return executionTimeUtc; }
    public void setExecutionTimeUtc(String executionTimeUtc) { this.executionTimeUtc = executionTimeUtc; }

    public String getExportFormat() { return exportFormat; }
    public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
