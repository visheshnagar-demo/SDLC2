package com.citidirect.cashstatement.dto;

public class AuthorizeRequestDTO {

    private String comments;

    public AuthorizeRequestDTO() {}

    public AuthorizeRequestDTO(String comments) {
        this.comments = comments;
    }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
