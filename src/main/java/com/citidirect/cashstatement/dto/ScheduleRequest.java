package com.citidirect.cashstatement.dto;

import java.util.Map;

public class ScheduleRequest {
    private String reportTemplateId;
    private String scheduleName;
    private String frequency;
    private String cronExpression;
    private String startDate;
    private String startTime;
    private Integer intradayHours;
    private Integer intradayMinutes;
    private Integer intradaySeconds;
    private String triggerEvent;
    private String notifyEmails;
    private String deliveryOptionId;
    private Map<String, Object> criteria;

    public ScheduleRequest() {}

    public String getReportTemplateId() { return reportTemplateId; }
    public void setReportTemplateId(String reportTemplateId) { this.reportTemplateId = reportTemplateId; }

    public String getScheduleName() { return scheduleName; }
    public void setScheduleName(String scheduleName) { this.scheduleName = scheduleName; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public Integer getIntradayHours() { return intradayHours; }
    public void setIntradayHours(Integer intradayHours) { this.intradayHours = intradayHours; }

    public Integer getIntradayMinutes() { return intradayMinutes; }
    public void setIntradayMinutes(Integer intradayMinutes) { this.intradayMinutes = intradayMinutes; }

    public Integer getIntradaySeconds() { return intradaySeconds; }
    public void setIntradaySeconds(Integer intradaySeconds) { this.intradaySeconds = intradaySeconds; }

    public String getTriggerEvent() { return triggerEvent; }
    public void setTriggerEvent(String triggerEvent) { this.triggerEvent = triggerEvent; }

    public String getNotifyEmails() { return notifyEmails; }
    public void setNotifyEmails(String notifyEmails) { this.notifyEmails = notifyEmails; }

    public String getDeliveryOptionId() { return deliveryOptionId; }
    public void setDeliveryOptionId(String deliveryOptionId) { this.deliveryOptionId = deliveryOptionId; }

    public Map<String, Object> getCriteria() { return criteria; }
    public void setCriteria(Map<String, Object> criteria) { this.criteria = criteria; }
}
