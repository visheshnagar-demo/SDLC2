package com.citidirect.cashstatement.dto;

import com.citidirect.cashstatement.entity.DeliveryOption;

import java.time.Instant;

public class DeliveryOptionResponse {
    private String id;
    private String channelType;
    private String destinationTarget;
    private String sftpFolderPath;
    private String encryptionProtocol;
    private String sshKeyMethod;
    private String status;
    private String makerId;
    private String checkerId;
    private String rejectionReason;
    private String checkerComments;
    private Instant createdAt;
    private Instant updatedAt;

    public DeliveryOptionResponse() {}

    public DeliveryOptionResponse(DeliveryOption deliveryOption) {
        this.id = deliveryOption.getId();
        this.channelType = deliveryOption.getChannelType();
        this.destinationTarget = deliveryOption.getDestinationTarget();
        this.sftpFolderPath = deliveryOption.getSftpFolderPath();
        this.encryptionProtocol = deliveryOption.getEncryptionProtocol();
        this.sshKeyMethod = deliveryOption.getSshKeyMethod();
        this.status = deliveryOption.getStatus();
        this.makerId = deliveryOption.getMakerId();
        this.checkerId = deliveryOption.getCheckerId();
        this.rejectionReason = deliveryOption.getRejectionReason();
        this.checkerComments = deliveryOption.getCheckerComments();
        this.createdAt = deliveryOption.getCreatedAt();
        this.updatedAt = deliveryOption.getUpdatedAt();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getChannelType() { return channelType; }
    public void setChannelType(String channelType) { this.channelType = channelType; }

    public String getDestinationTarget() { return destinationTarget; }
    public void setDestinationTarget(String destinationTarget) { this.destinationTarget = destinationTarget; }

    public String getSftpFolderPath() { return sftpFolderPath; }
    public void setSftpFolderPath(String sftpFolderPath) { this.sftpFolderPath = sftpFolderPath; }

    public String getEncryptionProtocol() { return encryptionProtocol; }
    public void setEncryptionProtocol(String encryptionProtocol) { this.encryptionProtocol = encryptionProtocol; }

    public String getSshKeyMethod() { return sshKeyMethod; }
    public void setSshKeyMethod(String sshKeyMethod) { this.sshKeyMethod = sshKeyMethod; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
