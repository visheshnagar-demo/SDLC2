package com.citidirect.cashstatement.dto;

public class AuthorizationRequest {
    private String authorizationAction; // AUTHORIZE or REJECT
    private String checkerComments;
    private String rejectionReason;

    public AuthorizationRequest() {}

    public String getAuthorizationAction() { return authorizationAction; }
    public void setAuthorizationAction(String authorizationAction) { this.authorizationAction = authorizationAction; }

    public String getCheckerComments() { return checkerComments; }
    public void setCheckerComments(String checkerComments) { this.checkerComments = checkerComments; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
