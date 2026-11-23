package com.identiverify.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class BiometricCheckRequest {

    @NotNull(message = "Verification ID is required")
    private UUID verificationId;

    @NotBlank(message = "Selfie image (base64 or frame data) is required")
    private String selfieBase64;

    public BiometricCheckRequest() {
    }

    public BiometricCheckRequest(UUID verificationId, String selfieBase64) {
        this.verificationId = verificationId;
        this.selfieBase64 = selfieBase64;
    }

    public UUID getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(UUID verificationId) {
        this.verificationId = verificationId;
    }

    public String getSelfieBase64() {
        return selfieBase64;
    }

    public void setSelfieBase64(String selfieBase64) {
        this.selfieBase64 = selfieBase64;
    }
}
