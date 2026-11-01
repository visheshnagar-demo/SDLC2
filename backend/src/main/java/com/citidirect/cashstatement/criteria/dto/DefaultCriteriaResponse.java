package com.citidirect.cashstatement.criteria.dto;

public class DefaultCriteriaResponse {

    private String baseReportName = "Account Statement – Comprehensive";
    private String derivedReportName = "";
    private String format = "Adobe(PDF) requires Acrobat Reader (5.0 or higher)";
    private boolean signWithCertificate = false;
    private boolean compressWithWinzip = false;
    private String designatedOwner = "JUSTIN,JOHN";
    private String share = "PRIVATE";
    private boolean favorite = false;

    private String accountSelectionType = "ACCOUNT";
    private String transactionCode = "Citi Transaction Codes";
    private String cheques = "Include Cheques";
    private String baseCurrency = "USD";

    private boolean showEnhancedTransactionDetails = false;
    private boolean outputAccountSubTotals = false;
    private boolean outputGrandTotal = false;
    private boolean showAdditionalOrderingPartyDetails = false;

    private String statementDateRadio = "YESTERDAY";
    private String valueDateRadio = "NO_DATE_SELECTED";

    private boolean pageBreaks = true;
    private boolean printChinaStamp = false;
    private boolean activityOnly = false;
    private boolean runInIncrementalMode = false;
    private boolean printSelectionCriteria = true;

    private CriteriaPayload criteriaPayload = new CriteriaPayload();

    public DefaultCriteriaResponse() {}

    public String getBaseReportName() {
        return baseReportName;
    }

    public void setBaseReportName(String baseReportName) {
        this.baseReportName = baseReportName;
    }

    public String getDerivedReportName() {
        return derivedReportName;
    }

    public void setDerivedReportName(String derivedReportName) {
        this.derivedReportName = derivedReportName;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
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

    public String getDesignatedOwner() {
        return designatedOwner;
    }

    public void setDesignatedOwner(String designatedOwner) {
        this.designatedOwner = designatedOwner;
    }

    public String getShare() {
        return share;
    }

    public void setShare(String share) {
        this.share = share;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }

    public String getAccountSelectionType() {
        return accountSelectionType;
    }

    public void setAccountSelectionType(String accountSelectionType) {
        this.accountSelectionType = accountSelectionType;
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

    public String getValueDateRadio() {
        return valueDateRadio;
    }

    public void setValueDateRadio(String valueDateRadio) {
        this.valueDateRadio = valueDateRadio;
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

    public CriteriaPayload getCriteriaPayload() {
        return criteriaPayload;
    }

    public void setCriteriaPayload(CriteriaPayload criteriaPayload) {
        this.criteriaPayload = criteriaPayload;
    }
}
