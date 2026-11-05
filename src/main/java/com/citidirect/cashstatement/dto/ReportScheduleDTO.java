package com.citidirect.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class ReportScheduleDTO {

    private String id;

    @JsonAlias({"criteria_id", "criteriaId"})
    private String criteriaId;

    private String frequency;

    @JsonAlias({"cron_expression", "cronExpression"})
    private String cronExpression;

    @JsonAlias({"execution_time_utc", "executionTimeUtc"})
    private String executionTimeUtc;

    @JsonAlias({"export_format", "exportFormat"})
    private String exportFormat;

    private String status;

    public ReportScheduleDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
