package com.citidirect.cashstatement.statement.dto;

import com.citidirect.cashstatement.criteria.dto.CriteriaPayload;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class StatementReportData {

    private String reportTitle = "Account Statement – Comprehensive Report";
    private String reportName;
    private String reportDate;
    private OffsetDateTime generationTimeGmt = OffsetDateTime.now();
    private CriteriaPayload criteria;
    private List<AccountSummaryData> accounts = new ArrayList<>();

    // Grand Totals across accounts if requested
    private BigDecimal grandOpeningBalance = BigDecimal.ZERO;
    private BigDecimal grandClosingBalance = BigDecimal.ZERO;
    private int grandCreditCount = 0;
    private BigDecimal grandTotalCreditAmount = BigDecimal.ZERO;
    private int grandDebitCount = 0;
    private BigDecimal grandTotalDebitAmount = BigDecimal.ZERO;
    private BigDecimal grandNetTransactionAmount = BigDecimal.ZERO;

    public StatementReportData() {}

    public String getReportTitle() {
        return reportTitle;
    }

    public void setReportTitle(String reportTitle) {
        this.reportTitle = reportTitle;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public String getReportDate() {
        return reportDate;
    }

    public void setReportDate(String reportDate) {
        this.reportDate = reportDate;
    }

    public OffsetDateTime getGenerationTimeGmt() {
        return generationTimeGmt;
    }

    public void setGenerationTimeGmt(OffsetDateTime generationTimeGmt) {
        this.generationTimeGmt = generationTimeGmt;
    }

    public CriteriaPayload getCriteria() {
        return criteria;
    }

    public void setCriteria(CriteriaPayload criteria) {
        this.criteria = criteria;
    }

    public List<AccountSummaryData> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<AccountSummaryData> accounts) {
        this.accounts = accounts;
    }

    public BigDecimal getGrandOpeningBalance() {
        return grandOpeningBalance;
    }

    public void setGrandOpeningBalance(BigDecimal grandOpeningBalance) {
        this.grandOpeningBalance = grandOpeningBalance;
    }

    public BigDecimal getGrandClosingBalance() {
        return grandClosingBalance;
    }

    public void setGrandClosingBalance(BigDecimal grandClosingBalance) {
        this.grandClosingBalance = grandClosingBalance;
    }

    public int getGrandCreditCount() {
        return grandCreditCount;
    }

    public void setGrandCreditCount(int grandCreditCount) {
        this.grandCreditCount = grandCreditCount;
    }

    public BigDecimal getGrandTotalCreditAmount() {
        return grandTotalCreditAmount;
    }

    public void setGrandTotalCreditAmount(BigDecimal grandTotalCreditAmount) {
        this.grandTotalCreditAmount = grandTotalCreditAmount;
    }

    public int getGrandDebitCount() {
        return grandDebitCount;
    }

    public void setGrandDebitCount(int grandDebitCount) {
        this.grandDebitCount = grandDebitCount;
    }

    public BigDecimal getGrandTotalDebitAmount() {
        return grandTotalDebitAmount;
    }

    public void setGrandTotalDebitAmount(BigDecimal grandTotalDebitAmount) {
        this.grandTotalDebitAmount = grandTotalDebitAmount;
    }

    public BigDecimal getGrandNetTransactionAmount() {
        return grandNetTransactionAmount;
    }

    public void setGrandNetTransactionAmount(BigDecimal grandNetTransactionAmount) {
        this.grandNetTransactionAmount = grandNetTransactionAmount;
    }
}
