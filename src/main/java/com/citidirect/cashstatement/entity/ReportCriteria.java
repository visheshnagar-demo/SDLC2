package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "report_criteria")
public class ReportCriteria {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "base_report_id", length = 64)
    private String baseReportId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "branch_code", length = 50)
    private String branchCode;

    @Column(name = "customer_id", length = 100)
    private String customerId;

    @Column(name = "account_numbers", columnDefinition = "TEXT")
    private String accountNumbersRaw;

    @Column(name = "currency", length = 10)
    private String currency = "USD";

    @Column(name = "date_preset", length = 50)
    private String datePreset;

    @Column(name = "date_from")
    private LocalDate dateFrom;

    @Column(name = "date_to")
    private LocalDate dateTo;

    @Column(name = "transaction_type", length = 50)
    private String transactionType = "ALL";

    @Column(name = "min_amount", precision = 18, scale = 2)
    private BigDecimal minAmount;

    @Column(name = "max_amount", precision = 18, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "export_format", length = 50)
    private String exportFormat = "PDF";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "status", length = 50)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ReportCriteria() {}

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

    public String getExportFormat() { return exportFormat; }
    public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
