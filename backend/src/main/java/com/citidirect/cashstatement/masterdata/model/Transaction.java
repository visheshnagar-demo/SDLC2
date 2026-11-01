package com.citidirect.cashstatement.masterdata.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "account_number", nullable = false, length = 34)
    private String accountNumber;

    @Column(name = "value_date", nullable = false)
    private LocalDate valueDate;

    @Column(name = "statement_date", nullable = false)
    private LocalDate statementDate;

    @Column(name = "customer_reference", length = 50)
    private String customerReference;

    @Column(name = "bank_reference", nullable = false, length = 50)
    private String bankReference;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "debit_credit", nullable = false, length = 1)
    private String debitCredit; // 'C' or 'D'

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "running_balance", nullable = false, precision = 18, scale = 2)
    private BigDecimal runningBalance;

    @Column(name = "ordering_party_name", length = 150)
    private String orderingPartyName;

    @Column(name = "ordering_party_account", length = 34)
    private String orderingPartyAccount;

    @Column(name = "ordering_party_address1", length = 100)
    private String orderingPartyAddress1;

    @Column(name = "ordering_party_address2", length = 100)
    private String orderingPartyAddress2;

    @Column(name = "ordering_bank", length = 100)
    private String orderingBank;

    @Column(name = "beneficiary_name", length = 150)
    private String beneficiaryName;

    @Column(name = "beneficiary_account", length = 34)
    private String beneficiaryAccount;

    @Column(name = "beneficiary_bank", length = 100)
    private String beneficiaryBank;

    @Column(name = "remittance_information", length = 255)
    private String remittanceInformation;

    @Column(name = "transaction_code", nullable = false, length = 20)
    private String transactionCode = "CITI001";

    @Column(name = "product_type", length = 50)
    private String productType;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(name = "enhanced_details", columnDefinition = "TEXT")
    private String enhancedDetails;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Transaction() {}

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

    public String getEnhancedDetails() {
        return enhancedDetails;
    }

    public void setEnhancedDetails(String enhancedDetails) {
        this.enhancedDetails = enhancedDetails;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
