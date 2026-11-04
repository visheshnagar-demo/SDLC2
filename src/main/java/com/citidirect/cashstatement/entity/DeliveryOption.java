package com.citidirect.cashstatement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delivery_options")
public class DeliveryOption {

    @Id
    @Column(length = 36)
    private String id;

    @Column(length = 36)
    private String scheduleId;

    @Column(nullable = false, length = 50)
    private String deliveryChannel; // EMAIL, SFTP, DOWNLOAD

    @Column(nullable = false, columnDefinition = "TEXT")
    private String destinationConfig; // JSON or serialized string

    @Column(nullable = false, length = 50)
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, AUTHORIZED, REJECTED

    @Column(nullable = false, length = 36)
    private String makerId;

    @Column(length = 36)
    private String checkerId;

    @Column(columnDefinition = "TEXT")
    private String checkerComments;

    private Instant authorizedAt;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public DeliveryOption() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getScheduleId() { return scheduleId; }
    public void setScheduleId(String scheduleId) { this.scheduleId = scheduleId; }

    public String getDeliveryChannel() { return deliveryChannel; }
    public void setDeliveryChannel(String deliveryChannel) { this.deliveryChannel = deliveryChannel; }

    public String getDestinationConfig() { return destinationConfig; }
    public void setDestinationConfig(String destinationConfig) { this.destinationConfig = destinationConfig; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMakerId() { return makerId; }
    public void setMakerId(String makerId) { this.makerId = makerId; }

    public String getCheckerId() { return checkerId; }
    public void setCheckerId(String checkerId) { this.checkerId = checkerId; }

    public String getCheckerComments() { return checkerComments; }
    public void setCheckerComments(String checkerComments) { this.checkerComments = checkerComments; }

    public Instant getAuthorizedAt() { return authorizedAt; }
    public void setAuthorizedAt(Instant authorizedAt) { this.authorizedAt = authorizedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
