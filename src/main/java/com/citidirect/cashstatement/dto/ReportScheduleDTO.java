package com.citidirect.cashstatement.dto;

public class ReportScheduleDTO {

    private String criteriaId;
    private String frequency = "WEEKLY";
    private String cronExpression = "0 0 8 ? * MON";
    private String executionTimeUtc = "08:00:00";
    private String exportFormat = "PDF";

    public ReportScheduleDTO() {}

    public String getCriteriaId() { return criteriaId; }
    public void setCriteriaId(String criteriaId) { this.criteriaId = criteriaId; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }

    public String getExecutionTimeUtc() { return executionTimeUtc; }
    public void setExecutionTimeUtc(String executionTimeUtc) { this.executionTimeUtc = executionTimeUtc; }

    public String getExportFormat() { return exportFormat; }
    public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }
}
