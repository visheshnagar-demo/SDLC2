package com.citidirect.cashstatement.scheduling.dto;

import java.time.OffsetDateTime;
import java.util.Map;

public class ScheduleResponse {

    private String id;
    private String scheduleReferenceId;
    private String scheduleName;
    private String eventType;
    private String eventName;
    private String derivedReportId;
    private String deliveryOptionId;
    private String deliveryOptionName;
    private String intervalType;
    private Map<String, Object> intervalConfig;
    private String holidayOption;
    private String runTimeUser;
    private String authStatus;
    private String makerId;
    private String makerUsername;
    private String checkerId;
    private String checkerUsername;
    private String rejectionReason;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public ScheduleResponse() {}

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

    public String getDeliveryOptionName() {
        return deliveryOptionName;
    }

    public void setDeliveryOptionName(String deliveryOptionName) {
        this.deliveryOptionName = deliveryOptionName;
    }

    public String getIntervalType() {
        return intervalType;
    }

    public void setIntervalType(String intervalType) {
        this.intervalType = intervalType;
    }

    public Map<String, Object> getIntervalConfig() {
        return intervalConfig;
    }

    public void setIntervalConfig(Map<String, Object> intervalConfig) {
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

    public String getMakerUsername() {
        return makerUsername;
    }

    public void setMakerUsername(String makerUsername) {
        this.makerUsername = makerUsername;
    }

    public String getCheckerId() {
        return checkerId;
    }

    public void setCheckerId(String checkerId) {
        this.checkerId = checkerId;
    }

    public String getCheckerUsername() {
        return checkerUsername;
    }

    public void setCheckerUsername(String checkerUsername) {
        this.checkerUsername = checkerUsername;
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
