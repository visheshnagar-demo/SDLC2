package com.identiverify.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class DocumentUploadRequest {

    @NotNull(message = "Verification ID is required")
    private UUID verificationId;

    @NotBlank(message = "Document type is required")
    private String documentType; // PASSPORT, DRIVERS_LICENSE, NATIONAL_ID

    private String issuingCountry;
    private String fileFront; // base64 or file identifier
    private String fileBack;

    public DocumentUploadRequest() {
    }

    public DocumentUploadRequest(UUID verificationId, String documentType, String issuingCountry) {
        this.verificationId = verificationId;
        this.documentType = documentType;
        this.issuingCountry = issuingCountry;
    }

    public UUID getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(UUID verificationId) {
        this.verificationId = verificationId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getIssuingCountry() {
        return issuingCountry;
    }

    public void setIssuingCountry(String issuingCountry) {
        this.issuingCountry = issuingCountry;
    }

    public String getFileFront() {
        return fileFront;
    }

    public void setFileFront(String fileFront) {
        this.fileFront = fileFront;
    }

    public String getFileBack() {
        return fileBack;
    }

    public void setFileBack(String fileBack) {
        this.fileBack = fileBack;
    }
}
