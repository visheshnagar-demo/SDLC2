package com.citidirect.cashstatement.dto;

public class LookupCustomerDTO {
    private String id;
    private String name;
    private String taxId;

    public LookupCustomerDTO() {}

    public LookupCustomerDTO(String id, String name, String taxId) {
        this.id = id;
        this.name = name;
        this.taxId = taxId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
}
