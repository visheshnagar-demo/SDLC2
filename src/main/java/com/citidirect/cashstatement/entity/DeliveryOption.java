package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delivery_option")
public class DeliveryOption {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "channel_type", nullable = false, length = 50)
    private String channelType; // EMAIL, SFTP, PORTAL

    @Column(name = "destination_target", nullable = false, length = 255)
    private String destinationTarget;

    @Column(name = "sftp_folder_path", length = 255)
    private String sftpFolderPath;

    @Column(name = "encryption_protocol", length = 50)
    private String encryptionProtocol;

    @Column(name = "ssh_key_method", length = 50)
    private String sshKeyMethod;

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

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public DeliveryOption() {
        this.id = UUID.randomUUID().toString();
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
