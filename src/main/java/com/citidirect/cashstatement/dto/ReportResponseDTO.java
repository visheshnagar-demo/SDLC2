package com.citidirect.cashstatement.dto;

import java.time.Instant;
import java.util.List;

public class ReportResponseDTO {

    private String id;
    private String reportName;
    private List<String> accountNumbers;
    private String branchCode;
    private String currency;
    private String exportFormat;
    private String status;
    private Instant createdAt;
    private String createdBy;

    public ReportResponseDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReportName() { return reportName; }
    public void setReportName(String reportName) { this.reportName = reportName; }

    public List<String> getAccountNumbers() { return accountNumbers; }
    public void setAccountNumbers(List<String> accountNumbers) { this.accountNumbers = accountNumbers; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getExportFormat() { return exportFormat; }
    public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
