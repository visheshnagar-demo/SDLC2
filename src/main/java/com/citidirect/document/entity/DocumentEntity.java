package com.citidirect.document.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class DocumentEntity {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @Column(name = "document_type", length = 50, nullable = false)
    private String documentType;

    @Column(name = "file_name", length = 255, nullable = false)
    private String fileName;

    @Column(name = "file_url", length = 512, nullable = false)
    private String fileUrl;

    @Column(name = "mime_type", length = 100, nullable = false)
    private String mimeType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_hash_sha256", length = 64, nullable = false)
    private String fileHashSha256;

    @Column(name = "extracted_full_name", length = 255)
    private String extractedFullName;

    @Column(name = "extracted_dob")
    private LocalDate extractedDob;

    @Column(name = "extracted_doc_number", length = 100)
    private String extractedDocNumber;

    @Column(name = "extracted_expiry_date")
    private LocalDate extractedExpiryDate;

    @Column(name = "ocr_confidence_score")
    private Double ocrConfidenceScore;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "warning_flags", length = 500)
    private String warningFlags;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public DocumentEntity() {
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileHashSha256() {
        return fileHashSha256;
    }

    public void setFileHashSha256(String fileHashSha256) {
        this.fileHashSha256 = fileHashSha256;
    }

    public String getExtractedFullName() {
        return extractedFullName;
    }

    public void setExtractedFullName(String extractedFullName) {
        this.extractedFullName = extractedFullName;
    }

    public LocalDate getExtractedDob() {
        return extractedDob;
    }

    public void setExtractedDob(LocalDate extractedDob) {
        this.extractedDob = extractedDob;
    }

    public String getExtractedDocNumber() {
        return extractedDocNumber;
    }

    public void setExtractedDocNumber(String extractedDocNumber) {
        this.extractedDocNumber = extractedDocNumber;
    }

    public LocalDate getExtractedExpiryDate() {
        return extractedExpiryDate;
    }

    public void setExtractedExpiryDate(LocalDate extractedExpiryDate) {
        this.extractedExpiryDate = extractedExpiryDate;
    }

    public Double getOcrConfidenceScore() {
        return ocrConfidenceScore;
    }

    public void setOcrConfidenceScore(Double ocrConfidenceScore) {
        this.ocrConfidenceScore = ocrConfidenceScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getWarningFlags() {
        return warningFlags;
    }

    public void setWarningFlags(String warningFlags) {
        this.warningFlags = warningFlags;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
