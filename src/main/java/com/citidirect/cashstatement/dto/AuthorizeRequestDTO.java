package com.citidirect.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class AuthorizeRequestDTO {

    @JsonAlias({"comments", "checker_comments", "checkerComments"})
    private String comments;

    public AuthorizeRequestDTO() {}

    public AuthorizeRequestDTO(String comments) {
        this.comments = comments;
    }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
