package com.citidirect.cashstatement.scheduling.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "report_schedules")
public class ReportSchedule {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "schedule_reference_id", nullable = false, unique = true, length = 30)
    private String scheduleReferenceId;

    @Column(name = "schedule_name", nullable = false, unique = true, length = 100)
    private String scheduleName;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType = "Report";

    @Column(name = "event_name", nullable = false, length = 100)
    private String eventName;

    @Column(name = "derived_report_id", nullable = false, length = 36)
    private String derivedReportId;

    @Column(name = "delivery_option_id", nullable = false, length = 36)
    private String deliveryOptionId;

    @Column(name = "interval_type", nullable = false, length = 30)
    private String intervalType; // ONCE, DAILY, WEEKLY, MONTHLY, EVENT_BASED

    @Column(name = "interval_config", nullable = false, columnDefinition = "TEXT")
    private String intervalConfig;

    @Column(name = "holiday_option", nullable = false, length = 30)
    private String holidayOption = "RUN_ALL_DAYS"; // RUN_ALL_DAYS, NEXT_BUSINESS_DAY, PREV_BUSINESS_DAY

    @Column(name = "run_time_user", length = 50)
    private String runTimeUser;

    @Column(name = "auth_status", nullable = false, length = 30)
    private String authStatus = "PENDING_AUTHORIZATION"; // PENDING_AUTHORIZATION, AUTHORIZED, REJECTED, REPAIR_REQUIRED

    @Column(name = "maker_id", nullable = false, length = 36)
    private String makerId;

    @Column(name = "checker_id", length = 36)
    private String checkerId;

    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ReportSchedule() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getScheduleReferenceId() {
        return scheduleReferenceId;
    }

    public void setScheduleReferenceId(String scheduleReferenceId) {
        this.scheduleReferenceId = scheduleReferenceId;
    }

    public String getScheduleName() {
        return scheduleName;
    }

    public void setScheduleName(String scheduleName) {
        this.scheduleName = scheduleName;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getDerivedReportId() {
        return derivedReportId;
    }

    public void setDerivedReportId(String derivedReportId) {
        this.derivedReportId = derivedReportId;
    }

    public String getDeliveryOptionId() {
        return deliveryOptionId;
    }

    public void setDeliveryOptionId(String deliveryOptionId) {
        this.deliveryOptionId = deliveryOptionId;
    }

    public String getIntervalType() {
        return intervalType;
    }

    public void setIntervalType(String intervalType) {
        this.intervalType = intervalType;
    }

    public String getIntervalConfig() {
        return intervalConfig;
    }

    public void setIntervalConfig(String intervalConfig) {
        this.intervalConfig = intervalConfig;
    }

    public String getHolidayOption() {
        return holidayOption;
    }

    public void setHolidayOption(String holidayOption) {
        this.holidayOption = holidayOption;
    }

    public String getRunTimeUser() {
        return runTimeUser;
    }

    public void setRunTimeUser(String runTimeUser) {
        this.runTimeUser = runTimeUser;
    }

    public String getAuthStatus() {
        return authStatus;
    }

    public void setAuthStatus(String authStatus) {
        this.authStatus = authStatus;
    }

    public String getMakerId() {
        return makerId;
    }

    public void setMakerId(String makerId) {
        this.makerId = makerId;
    }

    public String getCheckerId() {
        return checkerId;
    }

    public void setCheckerId(String checkerId) {
        this.checkerId = checkerId;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
