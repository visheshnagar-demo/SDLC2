package com.citidirect.cashstatement.delivery.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthorizationRequest {

    @NotBlank(message = "Action is required (AUTHORIZE, REJECT, or SEND_TO_REPAIR)")
    private String action; // AUTHORIZE, REJECT, SEND_TO_REPAIR

    private String comment;

    public AuthorizationRequest() {}

    public AuthorizationRequest(String action, String comment) {
        this.action = action;
        this.comment = comment;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
