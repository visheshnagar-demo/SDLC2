package com.citidirect.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReportRequestDTO {

    @JsonAlias({"base_report_id", "baseReportId"})
    private String baseReportId;

    private String name;

    @JsonAlias({"branch_code", "branchCode"})
    private String branchCode;

    @JsonAlias({"customer_id", "customerId"})
    private String customerId;

    @JsonAlias({"account_numbers", "accountNumbers"})
    private List<String> accountNumbers;

    private String currency = "USD";

    @JsonAlias({"date_preset", "datePreset"})
    private String datePreset;

    @JsonAlias({"date_from", "dateFrom"})
    private LocalDate dateFrom;

    @JsonAlias({"date_to", "dateTo"})
    private LocalDate dateTo;

    @JsonAlias({"transaction_type", "transactionType"})
    private String transactionType = "ALL";

    @JsonAlias({"min_amount", "minAmount"})
    private BigDecimal minAmount;

    @JsonAlias({"max_amount", "maxAmount"})
    private BigDecimal maxAmount;

    @JsonAlias({"export_format", "exportFormat"})
    private String exportFormat = "PDF";

    public ReportRequestDTO() {}

    public String getBaseReportId() { return baseReportId; }
    public void setBaseReportId(String baseReportId) { this.baseReportId = baseReportId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public List<String> getAccountNumbers() { return accountNumbers; }
    public void setAccountNumbers(List<String> accountNumbers) { this.accountNumbers = accountNumbers; }

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
}
