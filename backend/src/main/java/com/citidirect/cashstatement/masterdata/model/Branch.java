package com.citidirect.cashstatement.masterdata.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "branches")
public class Branch {

    @Id
    @Column(name = "branch_number", length = 10)
    private String branchNumber;

    @Column(name = "branch_name", nullable = false, length = 100)
    private String branchName;

    @Column(name = "swift_code", nullable = false, length = 20)
    private String swiftCode;

    @Column(name = "country_code", nullable = false, length = 3)
    private String countryCode;

    @Column(name = "running_balance_enabled", nullable = false)
    private boolean runningBalanceEnabled = true;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Branch() {}

    public Branch(String branchNumber, String branchName, String swiftCode, String countryCode, boolean runningBalanceEnabled) {
        this.branchNumber = branchNumber;
        this.branchName = branchName;
        this.swiftCode = swiftCode;
        this.countryCode = countryCode;
        this.runningBalanceEnabled = runningBalanceEnabled;
    }

    public String getBranchNumber() {
        return branchNumber;
    }

    public void setBranchNumber(String branchNumber) {
        this.branchNumber = branchNumber;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getSwiftCode() {
        return swiftCode;
    }

    public void setSwiftCode(String swiftCode) {
        this.swiftCode = swiftCode;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public boolean isRunningBalanceEnabled() {
        return runningBalanceEnabled;
    }

    public void setRunningBalanceEnabled(boolean runningBalanceEnabled) {
        this.runningBalanceEnabled = runningBalanceEnabled;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
