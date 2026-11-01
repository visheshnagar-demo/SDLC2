package com.citidirect.cashstatement.execution.dto;

import com.citidirect.cashstatement.criteria.dto.CriteriaPayload;

public class RunReportRequest {

    private String derivedReportId;
    private String reportName;
    private String overrideFormat; // PDF, XLS, CSV, DHTML, RTF
    private CriteriaPayload criteria;

    public RunReportRequest() {}

    public String getDerivedReportId() {
        return derivedReportId;
    }

    public void setDerivedReportId(String derivedReportId) {
        this.derivedReportId = derivedReportId;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public String getOverrideFormat() {
        return overrideFormat;
    }

    public void setOverrideFormat(String overrideFormat) {
        this.overrideFormat = overrideFormat;
    }

    public CriteriaPayload getCriteria() {
        return criteria;
    }

    public void setCriteria(CriteriaPayload criteria) {
        this.criteria = criteria;
    }
}
