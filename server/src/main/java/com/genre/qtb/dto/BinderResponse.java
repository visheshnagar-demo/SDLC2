package com.genre.qtb.dto;

import com.genre.qtb.model.PolicyBinderEntity;
import com.genre.qtb.model.QuoteEntity;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public class BinderResponse {
    private UUID id;
    private String policyReferenceId;
    private UUID quoteId;
    private String insuredName;
    private String lineOfBusiness;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private String boundBy;
    private Instant bindingTimestamp;
    private String status;
    private BigDecimal grossPremium;
    private BigDecimal limit;
    private Map<String, Object> documentSummary;

    public BinderResponse() {
    }

    public static BinderResponse fromEntity(PolicyBinderEntity binder, QuoteEntity quote) {
        BinderResponse response = new BinderResponse();
        response.setId(binder.getId());
        response.setPolicyReferenceId(binder.getPolicyReferenceId());
        response.setQuoteId(binder.getQuoteId());
        response.setEffectiveDate(binder.getEffectiveDate());
        response.setExpiryDate(binder.getExpiryDate());
        response.setBoundBy(binder.getBoundBy());
        response.setBindingTimestamp(binder.getBindingTimestamp());
        response.setStatus(binder.getStatus());
        response.setDocumentSummary(binder.getDocumentSummary());

        if (quote != null) {
            response.setInsuredName(quote.getInsuredName());
            response.setLineOfBusiness(quote.getLineOfBusiness());
            response.setGrossPremium(quote.getQuotedPremium());
            response.setLimit(quote.getSumInsured());
        }
        return response;
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

    public String getInsuredName() {
        return insuredName;
    }

    public void setInsuredName(String insuredName) {
        this.insuredName = insuredName;
    }

    public String getLineOfBusiness() {
        return lineOfBusiness;
    }

    public void setLineOfBusiness(String lineOfBusiness) {
        this.lineOfBusiness = lineOfBusiness;
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

    public BigDecimal getGrossPremium() {
        return grossPremium;
    }

    public void setGrossPremium(BigDecimal grossPremium) {
        this.grossPremium = grossPremium;
    }

    public BigDecimal getLimit() {
        return limit;
    }

    public void setLimit(BigDecimal limit) {
        this.limit = limit;
    }

    public Map<String, Object> getDocumentSummary() {
        return documentSummary;
    }

    public void setDocumentSummary(Map<String, Object> documentSummary) {
        this.documentSummary = documentSummary;
    }
}
