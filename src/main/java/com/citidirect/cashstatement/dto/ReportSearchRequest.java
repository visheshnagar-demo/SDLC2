package com.citidirect.cashstatement.dto;

public class ReportSearchRequest {
    private String accountNumber;
    private String branchCode;
    private String customerId;
    private String status;
    private String currency;
    private String fromDate;
    private String toDate;

    public ReportSearchRequest() {}

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getFromDate() { return fromDate; }
    public void setFromDate(String fromDate) { this.fromDate = fromDate; }

    public String getToDate() { return toDate; }
    public void setToDate(String toDate) { this.toDate = toDate; }
}
