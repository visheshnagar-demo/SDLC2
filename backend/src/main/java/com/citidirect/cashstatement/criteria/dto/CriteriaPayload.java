package com.citidirect.cashstatement.criteria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CriteriaPayload {

    private String branchNumber;
    private String customerNumber;
    private String accountSelectionType = "ACCOUNT"; // ACCOUNT or GROUP
    private String accountNumber;
    private String accountGroup;

    private String bankReference;
    private String bankReferenceOperator = "EQUALS"; // EQUALS, CONTAINS, STARTS_WITH
    private String customerReference;
    private String customerReferenceOperator = "EQUALS";

    private BigDecimal amountFrom;
    private BigDecimal amountTo;

    private String accountCurrency;
    private String transactionDescription;
    private String byOrderBeneficiary;
    private String transactionCode = "Citi Transaction Codes";
    private String cheques = "Include Cheques";
    private String baseCurrency = "USD";

    private boolean showEnhancedTransactionDetails = false;
    private boolean outputAccountSubTotals = false;
    private boolean outputGrandTotal = false;
    private boolean showAdditionalOrderingPartyDetails = false;

    private String statementDateRadio = "YESTERDAY";
    private LocalDate statementDateFrom;
    private LocalDate statementDateTo;

    private String valueDateRadio = "NO_DATE_SELECTED";
    private LocalDate valueDateFrom;
    private LocalDate valueDateTo;

    private boolean pageBreaks = true;
    private boolean printChinaStamp = false;
    private boolean activityOnly = false;
    private boolean runInIncrementalMode = false;
    private boolean printSelectionCriteria = true;

    private boolean signWithCertificate = false;
    private boolean compressWithWinzip = false;

    private String csvSeparator = ",";
    private String dateFormat = "MM/dd/yyyy";

    public CriteriaPayload() {}

    public String getBranchNumber() {
        return branchNumber;
    }

    public void setBranchNumber(String branchNumber) {
        this.branchNumber = branchNumber;
    }

    public String getCustomerNumber() {
        return customerNumber;
    }

    public void setCustomerNumber(String customerNumber) {
        this.customerNumber = customerNumber;
    }

    public String getAccountSelectionType() {
        return accountSelectionType;
    }

    public void setAccountSelectionType(String accountSelectionType) {
        this.accountSelectionType = accountSelectionType;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountGroup() {
        return accountGroup;
    }

    public void setAccountGroup(String accountGroup) {
        this.accountGroup = accountGroup;
    }

    public String getBankReference() {
        return bankReference;
    }

    public void setBankReference(String bankReference) {
        this.bankReference = bankReference;
    }

    public String getBankReferenceOperator() {
        return bankReferenceOperator;
    }

    public void setBankReferenceOperator(String bankReferenceOperator) {
        this.bankReferenceOperator = bankReferenceOperator;
    }

    public String getCustomerReference() {
        return customerReference;
    }

    public void setCustomerReference(String customerReference) {
        this.customerReference = customerReference;
    }

    public String getCustomerReferenceOperator() {
        return customerReferenceOperator;
    }

    public void setCustomerReferenceOperator(String customerReferenceOperator) {
        this.customerReferenceOperator = customerReferenceOperator;
    }

    public BigDecimal getAmountFrom() {
        return amountFrom;
    }

    public void setAmountFrom(BigDecimal amountFrom) {
        this.amountFrom = amountFrom;
    }

    public BigDecimal getAmountTo() {
        return amountTo;
    }

    public void setAmountTo(BigDecimal amountTo) {
        this.amountTo = amountTo;
    }

    public String getAccountCurrency() {
        return accountCurrency;
    }

    public void setAccountCurrency(String accountCurrency) {
        this.accountCurrency = accountCurrency;
    }

    public String getTransactionDescription() {
        return transactionDescription;
    }

    public void setTransactionDescription(String transactionDescription) {
        this.transactionDescription = transactionDescription;
    }

    public String getByOrderBeneficiary() {
        return byOrderBeneficiary;
    }

    public void setByOrderBeneficiary(String byOrderBeneficiary) {
        this.byOrderBeneficiary = byOrderBeneficiary;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public void setTransactionCode(String transactionCode) {
        this.transactionCode = transactionCode;
    }

    public String getCheques() {
        return cheques;
    }

    public void setCheques(String cheques) {
        this.cheques = cheques;
    }

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public void setBaseCurrency(String baseCurrency) {
        this.baseCurrency = baseCurrency;
    }

    public boolean isShowEnhancedTransactionDetails() {
        return showEnhancedTransactionDetails;
    }

    public void setShowEnhancedTransactionDetails(boolean showEnhancedTransactionDetails) {
        this.showEnhancedTransactionDetails = showEnhancedTransactionDetails;
    }

    public boolean isOutputAccountSubTotals() {
        return outputAccountSubTotals;
    }

    public void setOutputAccountSubTotals(boolean outputAccountSubTotals) {
        this.outputAccountSubTotals = outputAccountSubTotals;
    }

    public boolean isOutputGrandTotal() {
        return outputGrandTotal;
    }

    public void setOutputGrandTotal(boolean outputGrandTotal) {
        this.outputGrandTotal = outputGrandTotal;
    }

    public boolean isShowAdditionalOrderingPartyDetails() {
        return showAdditionalOrderingPartyDetails;
    }

    public void setShowAdditionalOrderingPartyDetails(boolean showAdditionalOrderingPartyDetails) {
        this.showAdditionalOrderingPartyDetails = showAdditionalOrderingPartyDetails;
    }

    public String getStatementDateRadio() {
        return statementDateRadio;
    }

    public void setStatementDateRadio(String statementDateRadio) {
        this.statementDateRadio = statementDateRadio;
    }

    public LocalDate getStatementDateFrom() {
        return statementDateFrom;
    }

    public void setStatementDateFrom(LocalDate statementDateFrom) {
        this.statementDateFrom = statementDateFrom;
    }

    public LocalDate getStatementDateTo() {
        return statementDateTo;
    }

    public void setStatementDateTo(LocalDate statementDateTo) {
        this.statementDateTo = statementDateTo;
    }

    public String getValueDateRadio() {
        return valueDateRadio;
    }

    public void setValueDateRadio(String valueDateRadio) {
        this.valueDateRadio = valueDateRadio;
    }

    public LocalDate getValueDateFrom() {
        return valueDateFrom;
    }

    public void setValueDateFrom(LocalDate valueDateFrom) {
        this.valueDateFrom = valueDateFrom;
    }

    public LocalDate getValueDateTo() {
        return valueDateTo;
    }

    public void setValueDateTo(LocalDate valueDateTo) {
        this.valueDateTo = valueDateTo;
    }

    public boolean isPageBreaks() {
        return pageBreaks;
    }

    public void setPageBreaks(boolean pageBreaks) {
        this.pageBreaks = pageBreaks;
    }

    public boolean isPrintChinaStamp() {
        return printChinaStamp;
    }

    public void setPrintChinaStamp(boolean printChinaStamp) {
        this.printChinaStamp = printChinaStamp;
    }

    public boolean isActivityOnly() {
        return activityOnly;
    }

    public void setActivityOnly(boolean activityOnly) {
        this.activityOnly = activityOnly;
    }

    public boolean isRunInIncrementalMode() {
        return runInIncrementalMode;
    }

    public void setRunInIncrementalMode(boolean runInIncrementalMode) {
        this.runInIncrementalMode = runInIncrementalMode;
    }

    public boolean isPrintSelectionCriteria() {
        return printSelectionCriteria;
    }

    public void setPrintSelectionCriteria(boolean printSelectionCriteria) {
        this.printSelectionCriteria = printSelectionCriteria;
    }

    public boolean isSignWithCertificate() {
        return signWithCertificate;
    }

    public void setSignWithCertificate(boolean signWithCertificate) {
        this.signWithCertificate = signWithCertificate;
    }

    public boolean isCompressWithWinzip() {
        return compressWithWinzip;
    }

    public void setCompressWithWinzip(boolean compressWithWinzip) {
        this.compressWithWinzip = compressWithWinzip;
    }

    public String getCsvSeparator() {
        return csvSeparator;
    }

    public void setCsvSeparator(String csvSeparator) {
        this.csvSeparator = csvSeparator;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }
}
