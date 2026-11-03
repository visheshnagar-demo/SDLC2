package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "report_schedule")
public class ReportSchedule {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "criteria_id", length = 36)
    private String criteriaId;

    @Column(name = "delivery_option_id", length = 36)
    private String deliveryOptionId;

    @Column(name = "schedule_name", nullable = false, length = 150)
    private String scheduleName;

    @Column(nullable = false, length = 50)
    private String frequency; // DAILY, WEEKLY, MONTHLY, CUSTOM

    @Column(name = "cron_expression", length = 100)
    private String cronExpression;

    @Column(name = "start_date", length = 50)
    private String startDate;

    @Column(name = "start_time", length = 50)
    private String startTime;

    @Column(name = "intraday_hours")
    private Integer intradayHours = 0;

    @Column(name = "intraday_minutes")
    private Integer intradayMinutes = 0;

    @Column(name = "intraday_seconds")
    private Integer intradaySeconds = 0;

    @Column(name = "trigger_event", length = 100)
    private String triggerEvent;

    @Column(name = "notify_emails", length = 500)
    private String notifyEmails;

    @Column(nullable = false, length = 50)
    private String status = "PENDING_AUTHORIZATION"; // PENDING_AUTHORIZATION, AUTHORIZED, REJECTED

    @Column(name = "maker_id", nullable = false, length = 36)
    private String makerId;

    @Column(name = "checker_id", length = 36)
    private String checkerId;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "checker_comments", length = 500)
    private String checkerComments;

    @Version
    private Integer version = 0;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public ReportSchedule() {
        this.id = UUID.randomUUID().toString();
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
