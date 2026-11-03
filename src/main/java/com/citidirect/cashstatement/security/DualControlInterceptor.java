package com.citidirect.cashstatement.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class DualControlInterceptor {

    public void validateDualControl(String makerId, String checkerId) {
        if (makerId != null && makerId.equals(checkerId)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "DUAL_CONTROL_SELF_AUTHORIZATION_BLOCKED: Maker cannot authorize or reject their own submission."
            );
        }
    }
}
