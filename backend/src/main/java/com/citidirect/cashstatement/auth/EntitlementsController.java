package com.citidirect.cashstatement.auth;

import com.citidirect.cashstatement.auth.dto.EntitlementsResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entitlements")
public class EntitlementsController {

    private final AuthService authService;

    public EntitlementsController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/user")
    public ResponseEntity<EntitlementsResponse> getCurrentUserEntitlements(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "usr-001";
        EntitlementsResponse response = authService.getUserEntitlements(userId);
        return ResponseEntity.ok(response);
    }
}
