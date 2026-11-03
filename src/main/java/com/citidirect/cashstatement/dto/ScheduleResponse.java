package com.citidirect.cashstatement.dto;

import com.citidirect.cashstatement.entity.ReportSchedule;

import java.time.Instant;

public class ScheduleResponse {
    private String id;
    private String criteriaId;
    private String deliveryOptionId;
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
    private String status;
    private String makerId;
    private String checkerId;
    private String rejectionReason;
    private String checkerComments;
    private Integer version;
    private Instant createdAt;
    private Instant updatedAt;

    public ScheduleResponse() {}

    public ScheduleResponse(ReportSchedule schedule) {
        this.id = schedule.getId();
        this.criteriaId = schedule.getCriteriaId();
        this.deliveryOptionId = schedule.getDeliveryOptionId();
        this.scheduleName = schedule.getScheduleName();
        this.frequency = schedule.getFrequency();
        this.cronExpression = schedule.getCronExpression();
        this.startDate = schedule.getStartDate();
        this.startTime = schedule.getStartTime();
        this.intradayHours = schedule.getIntradayHours();
        this.intradayMinutes = schedule.getIntradayMinutes();
        this.intradaySeconds = schedule.getIntradaySeconds();
        this.triggerEvent = schedule.getTriggerEvent();
        this.notifyEmails = schedule.getNotifyEmails();
        this.status = schedule.getStatus();
        this.makerId = schedule.getMakerId();
        this.checkerId = schedule.getCheckerId();
        this.rejectionReason = schedule.getRejectionReason();
        this.checkerComments = schedule.getCheckerComments();
        this.version = schedule.getVersion();
        this.createdAt = schedule.getCreatedAt();
        this.updatedAt = schedule.getUpdatedAt();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCriteriaId() { return criteriaId; }
    public void setCriteriaId(String criteriaId) { this.criteriaId = criteriaId; }

    public String getDeliveryOptionId() { return deliveryOptionId; }
    public void setDeliveryOptionId(String deliveryOptionId) { this.deliveryOptionId = deliveryOptionId; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMakerId() { return makerId; }
    public void setMakerId(String makerId) { this.makerId = makerId; }

    public String getCheckerId() { return checkerId; }
    public void setCheckerId(String checkerId) { this.checkerId = checkerId; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getCheckerComments() { return checkerComments; }
    public void setCheckerComments(String checkerComments) { this.checkerComments = checkerComments; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
