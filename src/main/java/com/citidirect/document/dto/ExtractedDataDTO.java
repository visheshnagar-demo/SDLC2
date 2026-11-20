package com.citidirect.document.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExtractedDataDTO {

    private String fullName;
    private LocalDate dateOfBirth;
    private String documentNumber;
    private LocalDate expiryDate;

    public ExtractedDataDTO() {
    }

    public ExtractedDataDTO(String fullName, LocalDate dateOfBirth, String documentNumber, LocalDate expiryDate) {
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.documentNumber = documentNumber;
        this.expiryDate = expiryDate;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
}
