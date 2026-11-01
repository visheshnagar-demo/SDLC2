package com.citidirect.cashstatement.scheduling.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class ScheduleRequest {

    @NotBlank(message = "Schedule Name is required")
    private String scheduleName;

    private String eventType = "Report";

    @NotBlank(message = "Event Name (Derived Report Name) is required")
    private String eventName;

    private String derivedReportId;

    @NotBlank(message = "Delivery Option is required")
    private String deliveryOptionId;

    @NotBlank(message = "Schedule Interval is required")
    private String intervalType = "DAILY"; // ONCE, DAILY, WEEKLY, MONTHLY, EVENT_BASED

    private Map<String, Object> intervalConfig;

    private String holidayOption = "RUN_ALL_DAYS"; // RUN_ALL_DAYS, NEXT_BUSINESS_DAY, PREV_BUSINESS_DAY

    private String runTimeUser;

    public ScheduleRequest() {}

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
}
