package com.citidirect.cashstatement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "generated_reports")
public class GeneratedReport {

    @Id
    @Column(length = 36)
    private String id;

    @Column(length = 36)
    private String criteriaId;

    @Column(nullable = false)
    private String reportName;

    @Column(nullable = false, length = 20)
    private String exportFormat; // PDF, EXCEL, CSV

    private Long fileSizeBytes;

    @Column(length = 500)
    private String storagePath;

    @Column(nullable = false, length = 50)
    private String status = "COMPLETED"; // GENERATING, COMPLETED, FAILED

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false, length = 36)
    private String generatedBy;

    @Column(nullable = false)
    private Instant createdAt;

    public GeneratedReport() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
    }

    public GeneratedReport(String reportName, String exportFormat, String status, String generatedBy) {
        this();
        this.reportName = reportName;
        this.exportFormat = exportFormat;
        this.status = status;
        this.generatedBy = generatedBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCriteriaId() { return criteriaId; }
    public void setCriteriaId(String criteriaId) { this.criteriaId = criteriaId; }

    public String getReportName() { return reportName; }
    public void setReportName(String reportName) { this.reportName = reportName; }

    public String getExportFormat() { return exportFormat; }
    public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
