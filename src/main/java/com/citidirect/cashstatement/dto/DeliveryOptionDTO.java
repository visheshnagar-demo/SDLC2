package com.citidirect.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.Map;

public class DeliveryOptionDTO {

    private String id;

    @JsonAlias({"schedule_id", "scheduleId"})
    private String scheduleId;

    @JsonAlias({"delivery_channel", "deliveryChannel"})
    private String deliveryChannel;

    @JsonAlias({"destination_config", "destinationConfig"})
    private Map<String, Object> destinationConfig;

    private String status;

    @JsonAlias({"maker_id", "makerId"})
    private String makerId;

    @JsonAlias({"maker_name", "makerName"})
    private String makerName;

    @JsonAlias({"checker_id", "checkerId"})
    private String checkerId;

    @JsonAlias({"checker_name", "checkerName"})
    private String checkerName;

    @JsonAlias({"checker_comments", "checkerComments"})
    private String checkerComments;

    @JsonAlias({"authorized_at", "authorizedAt"})
    private String authorizedAt;

    @JsonAlias({"created_at", "createdAt"})
    private String createdAt;

    public DeliveryOptionDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getScheduleId() { return scheduleId; }
    public void setScheduleId(String scheduleId) { this.scheduleId = scheduleId; }

    public String getDeliveryChannel() { return deliveryChannel; }
    public void setDeliveryChannel(String deliveryChannel) { this.deliveryChannel = deliveryChannel; }

    public Map<String, Object> getDestinationConfig() { return destinationConfig; }
    public void setDestinationConfig(Map<String, Object> destinationConfig) { this.destinationConfig = destinationConfig; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMakerId() { return makerId; }
    public void setMakerId(String makerId) { this.makerId = makerId; }

    public String getMakerName() { return makerName; }
    public void setMakerName(String makerName) { this.makerName = makerName; }

    public String getCheckerId() { return checkerId; }
    public void setCheckerId(String checkerId) { this.checkerId = checkerId; }

    public String getCheckerName() { return checkerName; }
    public void setCheckerName(String checkerName) { this.checkerName = checkerName; }

    public String getCheckerComments() { return checkerComments; }
    public void setCheckerComments(String checkerComments) { this.checkerComments = checkerComments; }

    public String getAuthorizedAt() { return authorizedAt; }
    public void setAuthorizedAt(String authorizedAt) { this.authorizedAt = authorizedAt; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
