package com.identiverify.dto;

import java.util.Map;
import java.util.UUID;

public class DocumentUploadResponse {

    private UUID documentId;
    private UUID verificationId;
    private String documentType;
    private String documentNumber;
    private String issuingCountry;
    private String expiryDate;
    private Double ocrConfidenceScore;
    private Map<String, Object> ocrExtractedFields;

    public DocumentUploadResponse() {
    }

    public DocumentUploadResponse(UUID documentId, UUID verificationId, String documentType,
                                  String documentNumber, String issuingCountry, String expiryDate,
                                  Double ocrConfidenceScore, Map<String, Object> ocrExtractedFields) {
        this.documentId = documentId;
        this.verificationId = verificationId;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.issuingCountry = issuingCountry;
        this.expiryDate = expiryDate;
        this.ocrConfidenceScore = ocrConfidenceScore;
        this.ocrExtractedFields = ocrExtractedFields;
    }

    public UUID getDocumentId() {
        return documentId;
    }

    public void setDocumentId(UUID documentId) {
        this.documentId = documentId;
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

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public String getIssuingCountry() {
        return issuingCountry;
    }

    public void setIssuingCountry(String issuingCountry) {
        this.issuingCountry = issuingCountry;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Double getOcrConfidenceScore() {
        return ocrConfidenceScore;
    }

    public void setOcrConfidenceScore(Double ocrConfidenceScore) {
        this.ocrConfidenceScore = ocrConfidenceScore;
    }

    public Map<String, Object> getOcrExtractedFields() {
        return ocrExtractedFields;
    }

    public void setOcrExtractedFields(Map<String, Object> ocrExtractedFields) {
        this.ocrExtractedFields = ocrExtractedFields;
    }
}
