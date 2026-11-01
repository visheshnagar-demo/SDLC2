package com.citidirect.cashstatement.execution.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "report_executions")
public class ReportExecution {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "derived_report_id", length = 36)
    private String derivedReportId;

    @Column(name = "report_name", nullable = false, length = 100)
    private String reportName;

    @Column(name = "executed_by_user_id", nullable = false, length = 36)
    private String executedByUserId;

    @Column(name = "execution_time_gmt", nullable = false)
    private OffsetDateTime executionTimeGmt = OffsetDateTime.now();

    @Column(name = "format", nullable = false, length = 50)
    private String format;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PROCESSING, COMPLETED, FAILED

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "records_count", nullable = false)
    private int recordsCount = 0;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ReportExecution() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDerivedReportId() {
        return derivedReportId;
    }

    public void setDerivedReportId(String derivedReportId) {
        this.derivedReportId = derivedReportId;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public String getExecutedByUserId() {
        return executedByUserId;
    }

    public void setExecutedByUserId(String executedByUserId) {
        this.executedByUserId = executedByUserId;
    }

    public OffsetDateTime getExecutionTimeGmt() {
        return executionTimeGmt;
    }

    public void setExecutionTimeGmt(OffsetDateTime executionTimeGmt) {
        this.executionTimeGmt = executionTimeGmt;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public int getRecordsCount() {
        return recordsCount;
    }

    public void setRecordsCount(int recordsCount) {
        this.recordsCount = recordsCount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
