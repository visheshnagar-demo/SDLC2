package com.citidirect.document.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DocumentResponseDTO {

    private String id;
    private String userId;
    private String documentType;
    private String fileName;
    private String fileUrl;
    private String mimeType;
    private Long fileSize;
    private String fileHashSha256;
    private ExtractedDataDTO extractedData;
    private Double ocrConfidence;
    private String status;
    private List<String> warningFlags = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public DocumentResponseDTO() {
    }

    public DocumentResponseDTO(
            String id,
            String userId,
            String documentType,
            String fileName,
            String fileUrl,
            String mimeType,
            Long fileSize,
            String fileHashSha256,
            ExtractedDataDTO extractedData,
            Double ocrConfidence,
            String status,
            List<String> warningFlags,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.documentType = documentType;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.fileHashSha256 = fileHashSha256;
        this.extractedData = extractedData;
        this.ocrConfidence = ocrConfidence;
        this.status = status;
        this.warningFlags = warningFlags != null ? warningFlags : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public ExtractedDataDTO getExtractedData() {
        return extractedData;
    }

    public void setExtractedData(ExtractedDataDTO extractedData) {
        this.extractedData = extractedData;
    }

    public Double getOcrConfidence() {
        return ocrConfidence;
    }

    public void setOcrConfidence(Double ocrConfidence) {
        this.ocrConfidence = ocrConfidence;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getWarningFlags() {
        return warningFlags;
    }

    public void setWarningFlags(List<String> warningFlags) {
        this.warningFlags = warningFlags != null ? warningFlags : new ArrayList<>();
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
