package com.citidirect.cashstatement.delivery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "delivery_options")
public class DeliveryOption {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "delivery_type", nullable = false, length = 20)
    private String deliveryType = "E-MAIL";

    @Column(name = "security_method", nullable = false, length = 50)
    private String securityMethod = "Citi Secure E-Mail";

    @Column(name = "email_recipients", nullable = false, columnDefinition = "TEXT")
    private String emailRecipients;

    @Column(name = "email_subject", nullable = false, length = 200)
    private String emailSubject;

    @Column(name = "email_message", columnDefinition = "TEXT")
    private String emailMessage;

    @Column(name = "file_name", nullable = false, length = 100)
    private String fileName;

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

    public DeliveryOption() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }

    public String getSecurityMethod() {
        return securityMethod;
    }

    public void setSecurityMethod(String securityMethod) {
        this.securityMethod = securityMethod;
    }

    public String getEmailRecipients() {
        return emailRecipients;
    }

    public void setEmailRecipients(String emailRecipients) {
        this.emailRecipients = emailRecipients;
    }

    public String getEmailSubject() {
        return emailSubject;
    }

    public void setEmailSubject(String emailSubject) {
        this.emailSubject = emailSubject;
    }

    public String getEmailMessage() {
        return emailMessage;
    }

    public void setEmailMessage(String emailMessage) {
        this.emailMessage = emailMessage;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
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
