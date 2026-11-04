package com.citidirect.cashstatement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "report_criteria")
public class ReportCriteria {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 36)
    private String baseReportId;

    @Column(nullable = false)
    private String name;

    @Column(length = 50)
    private String branchCode;

    @Column(length = 100)
    private String customerId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String accountNumbers; // Comma-separated list for SQLite/H2/Postgres compatibility

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(length = 50)
    private String datePreset;

    private LocalDate dateFrom;
    private LocalDate dateTo;

    @Column(length = 50)
    private String transactionType = "ALL";

    @Column(precision = 18, scale = 2)
    private BigDecimal minAmount;

    @Column(precision = 18, scale = 2)
    private BigDecimal maxAmount;

    @Column(nullable = false, length = 36)
    private String createdBy;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public ReportCriteria() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBaseReportId() { return baseReportId; }
    public void setBaseReportId(String baseReportId) { this.baseReportId = baseReportId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getAccountNumbers() { return accountNumbers; }
    public void setAccountNumbers(String accountNumbers) { this.accountNumbers = accountNumbers; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDatePreset() { return datePreset; }
    public void setDatePreset(String datePreset) { this.datePreset = datePreset; }

    public LocalDate getDateFrom() { return dateFrom; }
    public void setDateFrom(LocalDate dateFrom) { this.dateFrom = dateFrom; }

    public LocalDate getDateTo() { return dateTo; }
    public void setDateTo(LocalDate dateTo) { this.dateTo = dateTo; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public BigDecimal getMinAmount() { return minAmount; }
    public void setMinAmount(BigDecimal minAmount) { this.minAmount = minAmount; }

    public BigDecimal getMaxAmount() { return maxAmount; }
    public void setMaxAmount(BigDecimal maxAmount) { this.maxAmount = maxAmount; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
