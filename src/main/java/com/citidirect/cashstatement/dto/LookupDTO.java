package com.citidirect.cashstatement.dto;

import java.math.BigDecimal;

public class LookupDTO {

    public static class BranchLookup {
        private String code;
        private String name;

        public BranchLookup() {}
        public BranchLookup(String code, String name) {
            this.code = code;
            this.name = name;
        }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class CustomerLookup {
        private String id;
        private String name;

        public CustomerLookup() {}
        public CustomerLookup(String id, String name) {
            this.id = id;
            this.name = name;
        }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class AccountLookup {
        private String accountNumber;
        private String currency;
        private String branch;
        private BigDecimal balance;

        public AccountLookup() {}
        public AccountLookup(String accountNumber, String currency, String branch, BigDecimal balance) {
            this.accountNumber = accountNumber;
            this.currency = currency;
            this.branch = branch;
            this.balance = balance;
        }
        public String getAccountNumber() { return accountNumber; }
        public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }
        public BigDecimal getBalance() { return balance; }
        public void setBalance(BigDecimal balance) { this.balance = balance; }
    }

    public static class ReportNameLookup {
        private String id;
        private String code;
        private String name;
        private String category;

        public ReportNameLookup() {}
        public ReportNameLookup(String id, String code, String name, String category) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.category = category;
        }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
