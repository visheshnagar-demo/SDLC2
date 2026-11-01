package com.citidirect.cashstatement.scheduling.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "schedule_history")
public class ScheduleHistory {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "schedule_id", nullable = false, length = 36)
    private String scheduleId;

    @Column(name = "execution_time_gmt", nullable = false)
    private OffsetDateTime executionTimeGmt = OffsetDateTime.now();

    @Column(name = "status", nullable = false, length = 30)
    private String status; // SUCCESS, FAILED

    @Column(name = "records_processed", nullable = false)
    private int recordsProcessed = 0;

    @Column(name = "error_details", columnDefinition = "TEXT")
    private String errorDetails;

    @Column(name = "recipients", length = 255)
    private String recipients;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ScheduleHistory() {}

    public ScheduleHistory(String id, String scheduleId, OffsetDateTime executionTimeGmt, String status, int recordsProcessed, String errorDetails, String recipients) {
        this.id = id;
        this.scheduleId = scheduleId;
        this.executionTimeGmt = executionTimeGmt;
        this.status = status;
        this.recordsProcessed = recordsProcessed;
        this.errorDetails = errorDetails;
        this.recipients = recipients;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(String scheduleId) {
        this.scheduleId = scheduleId;
    }

    public OffsetDateTime getExecutionTimeGmt() {
        return executionTimeGmt;
    }

    public void setExecutionTimeGmt(OffsetDateTime executionTimeGmt) {
        this.executionTimeGmt = executionTimeGmt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getRecordsProcessed() {
        return recordsProcessed;
    }

    public void setRecordsProcessed(int recordsProcessed) {
        this.recordsProcessed = recordsProcessed;
    }

    public String getErrorDetails() {
        return errorDetails;
    }

    public void setErrorDetails(String errorDetails) {
        this.errorDetails = errorDetails;
    }

    public String getRecipients() {
        return recipients;
    }

    public void setRecipients(String recipients) {
        this.recipients = recipients;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
