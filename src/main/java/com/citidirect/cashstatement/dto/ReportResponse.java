package com.citidirect.cashstatement.dto;

import com.citidirect.cashstatement.entity.StatementLineItem;
import com.citidirect.cashstatement.entity.StatementReport;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class ReportResponse {
    private String id;
    private String criteriaId;
    private String reportName;
    private String reportType;
    private String branchCode;
    private String customerId;
    private String accountNumber;
    private String currency;
    private String generationStatus;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private String statementDate;
    private Instant generatedAt;
    private List<StatementLineItem> lineItems;

    public ReportResponse() {}

    public ReportResponse(StatementReport report, List<StatementLineItem> lineItems) {
        this.id = report.getId();
        this.criteriaId = report.getCriteriaId();
        this.reportName = report.getReportName();
        this.reportType = report.getReportType();
        this.branchCode = report.getBranchCode();
        this.customerId = report.getCustomerId();
        this.accountNumber = report.getAccountNumber();
        this.currency = report.getCurrency();
        this.generationStatus = report.getGenerationStatus();
        this.openingBalance = report.getOpeningBalance();
        this.closingBalance = report.getClosingBalance();
        this.totalDebits = report.getTotalDebits();
        this.totalCredits = report.getTotalCredits();
        this.statementDate = report.getStatementDate();
        this.generatedAt = report.getGeneratedAt();
        this.lineItems = lineItems;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCriteriaId() { return criteriaId; }
    public void setCriteriaId(String criteriaId) { this.criteriaId = criteriaId; }

    public String getReportName() { return reportName; }
    public void setReportName(String reportName) { this.reportName = reportName; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getGenerationStatus() { return generationStatus; }
    public void setGenerationStatus(String generationStatus) { this.generationStatus = generationStatus; }

    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }

    public BigDecimal getClosingBalance() { return closingBalance; }
    public void setClosingBalance(BigDecimal closingBalance) { this.closingBalance = closingBalance; }

    public BigDecimal getTotalDebits() { return totalDebits; }
    public void setTotalDebits(BigDecimal totalDebits) { this.totalDebits = totalDebits; }

    public BigDecimal getTotalCredits() { return totalCredits; }
    public void setTotalCredits(BigDecimal totalCredits) { this.totalCredits = totalCredits; }

    public String getStatementDate() { return statementDate; }
    public void setStatementDate(String statementDate) { this.statementDate = statementDate; }

    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

    public List<StatementLineItem> getLineItems() { return lineItems; }
    public void setLineItems(List<StatementLineItem> lineItems) { this.lineItems = lineItems; }
}
