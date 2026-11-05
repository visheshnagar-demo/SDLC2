package com.citidirect.cashstatement.dto;

import java.math.BigDecimal;

public class LookupAccountDTO {
    private String accountNumber;
    private String accountName;
    private String currency;
    private String branchCode;
    private BigDecimal balance;

    public LookupAccountDTO() {}

    public LookupAccountDTO(String accountNumber, String accountName, String currency, String branchCode, BigDecimal balance) {
        this.accountNumber = accountNumber;
        this.accountName = accountName;
        this.currency = currency;
        this.branchCode = branchCode;
        this.balance = balance;
    }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
