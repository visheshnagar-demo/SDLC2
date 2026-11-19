package com.sdlc.identity.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class RefreshRequest {

    @JsonAlias({"refresh_token", "refreshToken"})
    private String refreshToken;

    public RefreshRequest() {
    }

    public RefreshRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    @JsonProperty("refresh_token")
    public void setRefreshTokenSnake(String refreshToken) {
        if (this.refreshToken == null || this.refreshToken.isEmpty()) {
            this.refreshToken = refreshToken;
        }
    }
}
