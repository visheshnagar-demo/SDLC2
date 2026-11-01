package com.citidirect.cashstatement.criteria.model;

public class BaseReport {

    private String id;
    private String name;
    private String baseReportName;
    private String baseOrDerived;
    private String category;
    private String reportType;
    private boolean fullyFunctional;
    private boolean favorite;

    public BaseReport() {}

    public BaseReport(String id, String name, String category, String reportType, boolean fullyFunctional) {
        this.id = id;
        this.name = name;
        this.baseReportName = name;
        this.baseOrDerived = "Base";
        this.category = category;
        this.reportType = reportType;
        this.fullyFunctional = fullyFunctional;
        this.favorite = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBaseReportName() {
        return baseReportName;
    }

    public void setBaseReportName(String baseReportName) {
        this.baseReportName = baseReportName;
    }

    public String getBaseOrDerived() {
        return baseOrDerived;
    }

    public void setBaseOrDerived(String baseOrDerived) {
        this.baseOrDerived = baseOrDerived;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public boolean isFullyFunctional() {
        return fullyFunctional;
    }

    public void setFullyFunctional(boolean fullyFunctional) {
        this.fullyFunctional = fullyFunctional;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }
}
