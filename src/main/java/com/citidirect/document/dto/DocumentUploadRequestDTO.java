package com.citidirect.document.dto;

import jakarta.validation.constraints.NotBlank;
import org.springframework.web.multipart.MultipartFile;

public class DocumentUploadRequestDTO {

    private MultipartFile file;

    @NotBlank(message = "Document type is required")
    private String documentType;

    public DocumentUploadRequestDTO() {
    }

    public DocumentUploadRequestDTO(MultipartFile file, String documentType) {
        this.file = file;
        this.documentType = documentType;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }
}
