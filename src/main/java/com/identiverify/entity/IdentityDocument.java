package com.identiverify.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "identity_documents")
public class IdentityDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_id", nullable = false)
    private VerificationRequest verificationRequest;

    @Column(name = "document_type", nullable = false)
    private String documentType; // PASSPORT, DRIVERS_LICENSE, NATIONAL_ID

    @Column(name = "document_number")
    private String documentNumber;

    @Column(name = "issuing_country")
    private String issuingCountry;

    @Column(name = "expiry_date")
    private String expiryDate;

    @Column(name = "ocr_confidence_score")
    private Double ocrConfidenceScore;

    @Column(name = "ocr_raw_payload", columnDefinition = "TEXT")
    private String ocrRawPayload;

    @Column(name = "storage_path_front")
    private String storagePathFront;

    @Column(name = "storage_path_back")
    private String storagePathBack;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public IdentityDocument() {
    }

    public IdentityDocument(VerificationRequest verificationRequest, String documentType, String issuingCountry) {
        this.verificationRequest = verificationRequest;
        this.documentType = documentType;
        this.issuingCountry = issuingCountry;
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public VerificationRequest getVerificationRequest() {
        return verificationRequest;
    }

    public void setVerificationRequest(VerificationRequest verificationRequest) {
        this.verificationRequest = verificationRequest;
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

    public String getOcrRawPayload() {
        return ocrRawPayload;
    }

    public void setOcrRawPayload(String ocrRawPayload) {
        this.ocrRawPayload = ocrRawPayload;
    }

    public String getStoragePathFront() {
        return storagePathFront;
    }

    public void setStoragePathFront(String storagePathFront) {
        this.storagePathFront = storagePathFront;
    }

    public String getStoragePathBack() {
        return storagePathBack;
    }

    public void setStoragePathBack(String storagePathBack) {
        this.storagePathBack = storagePathBack;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
