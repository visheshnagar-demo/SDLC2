package com.citidirect.cashstatement.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class DeliveryOptionRequest {

    @NotBlank(message = "Delivery Option Name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Delivery Option Type is required")
    private String deliveryType = "E-MAIL";

    @NotBlank(message = "Security Method is required")
    private String securityMethod = "Citi Secure E-Mail";

    @NotBlank(message = "Email Address(es) are required")
    private String emailRecipients;

    @NotBlank(message = "Message Subject is required")
    private String emailSubject;

    private String emailMessage;

    @NotBlank(message = "File Name is required")
    @Pattern(regexp = "^[a-zA-Z0-9_\\-\\.]+$", message = "File Name must not contain spaces or special path characters")
    private String fileName;

    public DeliveryOptionRequest() {}

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
}
