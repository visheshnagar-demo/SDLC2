package com.genre.qtb.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public class PolicyBinderEntity {
    private UUID id;
    private String policyReferenceId;
    private UUID quoteId;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private String boundBy;
    private Instant bindingTimestamp;
    private String status;
    private Map<String, Object> documentSummary;

    public PolicyBinderEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getPolicyReferenceId() {
        return policyReferenceId;
    }

    public void setPolicyReferenceId(String policyReferenceId) {
        this.policyReferenceId = policyReferenceId;
    }

    public UUID getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(UUID quoteId) {
        this.quoteId = quoteId;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getBoundBy() {
        return boundBy;
    }

    public void setBoundBy(String boundBy) {
        this.boundBy = boundBy;
    }

    public Instant getBindingTimestamp() {
        return bindingTimestamp;
    }

    public void setBindingTimestamp(Instant bindingTimestamp) {
        this.bindingTimestamp = bindingTimestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, Object> getDocumentSummary() {
        return documentSummary;
    }

    public void setDocumentSummary(Map<String, Object> documentSummary) {
        this.documentSummary = documentSummary;
    }
}
