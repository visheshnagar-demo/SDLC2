package com.citidirect.cashstatement.execution.dto;

import java.time.OffsetDateTime;

public class ExecutionResponse {

    private String id;
    private String derivedReportId;
    private String reportName;
    private String executedByUserId;
    private OffsetDateTime executionTimeGmt;
    private String format;
    private String status;
    private String fileName;
    private int recordsCount;
    private String downloadUrl;

    public ExecutionResponse() {}

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

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}
