package com.citidirect.cashstatement.auth.dto;

import java.util.List;

public class EntitlementsResponse {

    private List<String> branches;
    private List<String> customers;
    private List<String> accounts;

    public EntitlementsResponse() {}

    public EntitlementsResponse(List<String> branches, List<String> customers, List<String> accounts) {
        this.branches = branches;
        this.customers = customers;
        this.accounts = accounts;
    }

    public List<String> getBranches() {
        return branches;
    }

    public void setBranches(List<String> branches) {
        this.branches = branches;
    }

    public List<String> getCustomers() {
        return customers;
    }

    public void setCustomers(List<String> customers) {
        this.customers = customers;
    }

    public List<String> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<String> accounts) {
        this.accounts = accounts;
    }
}
