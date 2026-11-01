package com.citidirect.cashstatement.statement.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AccountSummaryData {

    private String bankName = "CITIBANK";
    private String customerNumber;
    private String customerName;
    private String branchNumber;
    private String branchName;
    private String swiftCode;
    private String accountNumber;
    private String accountName;
    private String currency;
    private String accountType;
    private String statementDate;
    private boolean runningBalanceEnabled;

    private BigDecimal openingAvailableBalance = BigDecimal.ZERO;
    private BigDecimal closingAvailableBalance = BigDecimal.ZERO;
    private int creditCount = 0;
    private BigDecimal totalCreditAmount = BigDecimal.ZERO;
    private int debitCount = 0;
    private BigDecimal totalDebitAmount = BigDecimal.ZERO;
    private BigDecimal netTransactionAmount = BigDecimal.ZERO;

    private List<TransactionRecord> transactions = new ArrayList<>();

    public AccountSummaryData() {}

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getCustomerNumber() {
        return customerNumber;
    }

    public void setCustomerNumber(String customerNumber) {
        this.customerNumber = customerNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getBranchNumber() {
        return branchNumber;
    }

    public void setBranchNumber(String branchNumber) {
        this.branchNumber = branchNumber;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getSwiftCode() {
        return swiftCode;
    }

    public void setSwiftCode(String swiftCode) {
        this.swiftCode = swiftCode;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getStatementDate() {
        return statementDate;
    }

    public void setStatementDate(String statementDate) {
        this.statementDate = statementDate;
    }

    public boolean isRunningBalanceEnabled() {
        return runningBalanceEnabled;
    }

    public void setRunningBalanceEnabled(boolean runningBalanceEnabled) {
        this.runningBalanceEnabled = runningBalanceEnabled;
    }

    public BigDecimal getOpeningAvailableBalance() {
        return openingAvailableBalance;
    }

    public void setOpeningAvailableBalance(BigDecimal openingAvailableBalance) {
        this.openingAvailableBalance = openingAvailableBalance;
    }

    public BigDecimal getClosingAvailableBalance() {
        return closingAvailableBalance;
    }

    public void setClosingAvailableBalance(BigDecimal closingAvailableBalance) {
        this.closingAvailableBalance = closingAvailableBalance;
    }

    public int getCreditCount() {
        return creditCount;
    }

    public void setCreditCount(int creditCount) {
        this.creditCount = creditCount;
    }

    public BigDecimal getTotalCreditAmount() {
        return totalCreditAmount;
    }

    public void setTotalCreditAmount(BigDecimal totalCreditAmount) {
        this.totalCreditAmount = totalCreditAmount;
    }

    public int getDebitCount() {
        return debitCount;
    }

    public void setDebitCount(int debitCount) {
        this.debitCount = debitCount;
    }

    public BigDecimal getTotalDebitAmount() {
        return totalDebitAmount;
    }

    public void setTotalDebitAmount(BigDecimal totalDebitAmount) {
        this.totalDebitAmount = totalDebitAmount;
    }

    public BigDecimal getNetTransactionAmount() {
        return netTransactionAmount;
    }

    public void setNetTransactionAmount(BigDecimal netTransactionAmount) {
        this.netTransactionAmount = netTransactionAmount;
    }

    public List<TransactionRecord> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionRecord> transactions) {
        this.transactions = transactions;
    }
}
