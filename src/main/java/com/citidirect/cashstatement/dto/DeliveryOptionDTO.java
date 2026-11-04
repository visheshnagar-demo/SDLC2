package com.citidirect.cashstatement.dto;

import java.util.Map;

public class DeliveryOptionDTO {

    private String scheduleId;
    private String deliveryChannel; // EMAIL, SFTP, DOWNLOAD
    private Map<String, Object> destinationConfig;

    public DeliveryOptionDTO() {}

    public String getScheduleId() { return scheduleId; }
    public void setScheduleId(String scheduleId) { this.scheduleId = scheduleId; }

    public String getDeliveryChannel() { return deliveryChannel; }
    public void setDeliveryChannel(String deliveryChannel) { this.deliveryChannel = deliveryChannel; }

    public Map<String, Object> getDestinationConfig() { return destinationConfig; }
    public void setDestinationConfig(Map<String, Object> destinationConfig) { this.destinationConfig = destinationConfig; }
}
