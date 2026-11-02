package com.citidirect.cashstatement.statement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRecord {

    private String id;
    private String accountNumber;
    private LocalDate valueDate;
    private LocalDate statementDate;
    private String customerReference;
    private String bankReference;
    private String description;
    private String debitCredit; // 'C' or 'D'
    private BigDecimal amount;
    private BigDecimal runningBalance;
    private String orderingPartyName;
    private String orderingPartyAccount;
    private String orderingPartyAddress1;
    private String orderingPartyAddress2;
    private String orderingBank;
    private String beneficiaryName;
    private String beneficiaryAccount;
    private String beneficiaryBank;
    private String remittanceInformation;
    private String transactionCode;
    private String productType;
    private String batchNumber;
    private String chequeNumber;
    private String enhancedDetails;

    public TransactionRecord() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public LocalDate getValueDate() {
        return valueDate;
    }

    public void setValueDate(LocalDate valueDate) {
        this.valueDate = valueDate;
    }

    public LocalDate getStatementDate() {
        return statementDate;
    }

    public void setStatementDate(LocalDate statementDate) {
        this.statementDate = statementDate;
    }

    public String getCustomerReference() {
        return customerReference;
    }

    public void setCustomerReference(String customerReference) {
        this.customerReference = customerReference;
    }

    public String getBankReference() {
        return bankReference;
    }

    public void setBankReference(String bankReference) {
        this.bankReference = bankReference;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDebitCredit() {
        return debitCredit;
    }

    public void setDebitCredit(String debitCredit) {
        this.debitCredit = debitCredit;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getRunningBalance() {
        return runningBalance;
    }

    public void setRunningBalance(BigDecimal runningBalance) {
        this.runningBalance = runningBalance;
    }

    public String getOrderingPartyName() {
        return orderingPartyName;
    }

    public void setOrderingPartyName(String orderingPartyName) {
        this.orderingPartyName = orderingPartyName;
    }

    public String getOrderingPartyAccount() {
        return orderingPartyAccount;
    }

    public void setOrderingPartyAccount(String orderingPartyAccount) {
        this.orderingPartyAccount = orderingPartyAccount;
    }

    public String getOrderingPartyAddress1() {
        return orderingPartyAddress1;
    }

    public void setOrderingPartyAddress1(String orderingPartyAddress1) {
        this.orderingPartyAddress1 = orderingPartyAddress1;
    }

    public String getOrderingPartyAddress2() {
        return orderingPartyAddress2;
    }

    public void setOrderingPartyAddress2(String orderingPartyAddress2) {
        this.orderingPartyAddress2 = orderingPartyAddress2;
    }

    public String getOrderingBank() {
        return orderingBank;
    }

    public void setOrderingBank(String orderingBank) {
        this.orderingBank = orderingBank;
    }

    public String getBeneficiaryName() {
        return beneficiaryName;
    }

    public void setBeneficiaryName(String beneficiaryName) {
        this.beneficiaryName = beneficiaryName;
    }

    public String getBeneficiaryAccount() {
        return beneficiaryAccount;
    }

    public void setBeneficiaryAccount(String beneficiaryAccount) {
        this.beneficiaryAccount = beneficiaryAccount;
    }

    public String getBeneficiaryBank() {
        return beneficiaryBank;
    }

    public void setBeneficiaryBank(String beneficiaryBank) {
        this.beneficiaryBank = beneficiaryBank;
    }

    public String getRemittanceInformation() {
        return remittanceInformation;
    }

    public void setRemittanceInformation(String remittanceInformation) {
        this.remittanceInformation = remittanceInformation;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public void setTransactionCode(String transactionCode) {
        this.transactionCode = transactionCode;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public String getChequeNumber() {
        return chequeNumber;
    }

    public void setChequeNumber(String chequeNumber) {
        this.chequeNumber = chequeNumber;
    }


    public String getEnhancedDetails() {
        return enhancedDetails;
    }

    public void setEnhancedDetails(String enhancedDetails) {
        this.enhancedDetails = enhancedDetails;
    }
}
