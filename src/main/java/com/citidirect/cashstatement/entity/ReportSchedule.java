package com.citidirect.cashstatement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "report_schedules")
public class ReportSchedule {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 36)
    private String criteriaId;

    @Column(nullable = false, length = 50)
    private String frequency; // DAILY, WEEKLY, MONTHLY, CUSTOM

    @Column(nullable = false, length = 100)
    private String cronExpression;

    @Column(nullable = false, length = 20)
    private String executionTimeUtc;

    @Column(nullable = false, length = 20)
    private String exportFormat; // PDF, EXCEL, CSV

    @Column(nullable = false, length = 50)
    private String status = "PENDING_APPROVAL"; // ACTIVE, PAUSED, PENDING_APPROVAL, REJECTED

    @Column(nullable = false, length = 36)
    private String createdBy;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public ReportSchedule() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
