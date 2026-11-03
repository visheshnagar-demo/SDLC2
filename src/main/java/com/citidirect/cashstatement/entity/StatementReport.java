package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "statement_report")
public class StatementReport {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "criteria_id", length = 36)
    private String criteriaId;

    @Column(name = "report_name", nullable = false, length = 150)
    private String reportName;

    @Column(name = "report_type", nullable = false, length = 50)
    private String reportType; // CASH_STATEMENT, INTRADAY_POSITION

    @Column(name = "branch_code", length = 50)
    private String branchCode;

    @Column(name = "customer_id", length = 50)
    private String customerId;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(length = 10)
    private String currency;

    @Column(name = "generation_status", nullable = false, length = 50)
    private String generationStatus = "COMPLETED";

    @Column(name = "opening_balance", precision = 18, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "closing_balance", precision = 18, scale = 2)
    private BigDecimal closingBalance = BigDecimal.ZERO;

    @Column(name = "total_debits", precision = 18, scale = 2)
    private BigDecimal totalDebits = BigDecimal.ZERO;

    @Column(name = "total_credits", precision = 18, scale = 2)
    private BigDecimal totalCredits = BigDecimal.ZERO;

    @Column(name = "statement_date", length = 50)
    private String statementDate;

    @Column(name = "generated_at")
    private Instant generatedAt = Instant.now();

    public StatementReport() {
        this.id = UUID.randomUUID().toString();
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
}
