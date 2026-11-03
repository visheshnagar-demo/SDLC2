package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "report_criteria")
public class ReportCriteria {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "created_by", nullable = false, length = 36)
    private String createdBy;

    @Column(name = "customer_id", length = 50)
    private String customerId;

    @Column(name = "branch_code", length = 50)
    private String branchCode;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(length = 10)
    private String currency;

    @Column(name = "date_matrix_type", length = 50)
    private String dateMatrixType;

    @Column(name = "statement_date", length = 50)
    private String statementDate;

    @Column(name = "value_date", length = 50)
    private String valueDate;

    @Column(name = "report_template_id", length = 100)
    private String reportTemplateId;

    @Column(name = "report_name", length = 150)
    private String reportName;

    @Column(name = "designated_owner", length = 100)
    private String designatedOwner;

    @Column(name = "bank_reference", length = 100)
    private String bankReference;

    @Column(name = "customer_reference", length = 100)
    private String customerReference;

    @Column(name = "service_class_id", length = 50)
    private String serviceClassId;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public ReportCriteria() {
        this.id = UUID.randomUUID().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDateMatrixType() { return dateMatrixType; }
    public void setDateMatrixType(String dateMatrixType) { this.dateMatrixType = dateMatrixType; }

    public String getStatementDate() { return statementDate; }
    public void setStatementDate(String statementDate) { this.statementDate = statementDate; }

    public String getValueDate() { return valueDate; }
    public void setValueDate(String valueDate) { this.valueDate = valueDate; }

    public String getReportTemplateId() { return reportTemplateId; }
    public void setReportTemplateId(String reportTemplateId) { this.reportTemplateId = reportTemplateId; }

    public String getReportName() { return reportName; }
    public void setReportName(String reportName) { this.reportName = reportName; }

    public String getDesignatedOwner() { return designatedOwner; }
    public void setDesignatedOwner(String designatedOwner) { this.designatedOwner = designatedOwner; }

    public String getBankReference() { return bankReference; }
    public void setBankReference(String bankReference) { this.bankReference = bankReference; }

    public String getCustomerReference() { return customerReference; }
    public void setCustomerReference(String customerReference) { this.customerReference = customerReference; }

    public String getServiceClassId() { return serviceClassId; }
    public void setServiceClassId(String serviceClassId) { this.serviceClassId = serviceClassId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
