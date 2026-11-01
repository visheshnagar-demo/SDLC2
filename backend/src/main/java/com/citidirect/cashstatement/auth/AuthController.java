package com.citidirect.cashstatement.auth;

import com.citidirect.cashstatement.auth.dto.AuthResponse;
import com.citidirect.cashstatement.auth.dto.EntitlementsResponse;
import com.citidirect.cashstatement.auth.dto.LoginRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/api/v1/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping({"/api/v1/entitlements/user", "/api/v1/auth/entitlements"})
    public ResponseEntity<EntitlementsResponse> getUserEntitlements(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "usr-001";
        EntitlementsResponse response = authService.getUserEntitlements(userId);
        return ResponseEntity.ok(response);
    }
}
