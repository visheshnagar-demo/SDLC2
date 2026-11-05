package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_options")
public class DeliveryOption {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "schedule_id", length = 64)
    private String scheduleId;

    @Column(name = "delivery_channel", nullable = false, length = 50)
    private String deliveryChannel; // SFTP, EMAIL, PORTAL, DOWNLOAD

    @Column(name = "destination_config", columnDefinition = "TEXT")
    private String destinationConfigJson;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, AUTHORIZED, REJECTED

    @Column(name = "maker_id", length = 64)
    private String makerId;

    @Column(name = "maker_name", length = 255)
    private String makerName;

    @Column(name = "checker_id", length = 64)
    private String checkerId;

    @Column(name = "checker_name", length = 255)
    private String checkerName;

    @Column(name = "checker_comments", columnDefinition = "TEXT")
    private String checkerComments;

    @Column(name = "authorized_at")
    private LocalDateTime authorizedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public DeliveryOption() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getScheduleId() { return scheduleId; }
    public void setScheduleId(String scheduleId) { this.scheduleId = scheduleId; }

    public String getDeliveryChannel() { return deliveryChannel; }
    public void setDeliveryChannel(String deliveryChannel) { this.deliveryChannel = deliveryChannel; }

    public String getDestinationConfigJson() { return destinationConfigJson; }
    public void setDestinationConfigJson(String destinationConfigJson) { this.destinationConfigJson = destinationConfigJson; }

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

    public LocalDateTime getAuthorizedAt() { return authorizedAt; }
    public void setAuthorizedAt(LocalDateTime authorizedAt) { this.authorizedAt = authorizedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
