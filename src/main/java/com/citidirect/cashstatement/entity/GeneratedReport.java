package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "generated_reports")
public class GeneratedReport {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "criteria_id", length = 64)
    private String criteriaId;

    @Column(name = "report_name", nullable = false, length = 255)
    private String reportName;

    @Column(name = "account_numbers", columnDefinition = "TEXT")
    private String accountNumbersRaw;

    @Column(name = "branch_code", length = 50)
    private String branchCode;

    @Column(name = "frequency", length = 100)
    private String frequency;

    @Column(name = "export_format", nullable = false, length = 50)
    private String exportFormat = "PDF";

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "storage_path", length = 500)
    private String storagePath;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "COMPLETED"; // GENERATING, COMPLETED, PENDING_APPROVAL, REJECTED, FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public GeneratedReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCriteriaId() { return criteriaId; }
    public void setCriteriaId(String criteriaId) { this.criteriaId = criteriaId; }

    public String getReportName() { return reportName; }
    public void setReportName(String reportName) { this.reportName = reportName; }

    public List<String> getAccountNumbers() {
        if (accountNumbersRaw == null || accountNumbersRaw.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(accountNumbersRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setAccountNumbers(List<String> accountNumbers) {
        if (accountNumbers == null || accountNumbers.isEmpty()) {
            this.accountNumbersRaw = "";
        } else {
            this.accountNumbersRaw = String.join(",", accountNumbers);
        }
    }

    public String getAccountNumbersRaw() { return accountNumbersRaw; }
    public void setAccountNumbersRaw(String accountNumbersRaw) { this.accountNumbersRaw = accountNumbersRaw; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

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

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
