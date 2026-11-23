package com.identiverify.controller;

import com.identiverify.dto.VerificationResponse;
import com.identiverify.entity.User;
import com.identiverify.service.AuthService;
import com.identiverify.service.VerificationOrchestrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/verifications")
public class VerificationController {

    private final VerificationOrchestrationService verificationService;
    private final AuthService authService;

    public VerificationController(VerificationOrchestrationService verificationService, AuthService authService) {
        this.verificationService = verificationService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<VerificationResponse> initiateVerification(@RequestBody(required = false) Map<String, String> payload,
                                                                     Authentication authentication) {
        UUID userId = null;
        if (payload != null && payload.containsKey("userId")) {
            userId = UUID.fromString(payload.get("userId"));
        } else if (authentication != null && authentication.getName() != null) {
            User user = authService.getUserByEmail(authentication.getName());
            userId = user.getId();
        } else {
            // Default to test user
            User user = authService.getUserByEmail("test@example.com");
            userId = user.getId();
        }

        VerificationResponse response = verificationService.createVerification(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VerificationResponse> getVerification(@PathVariable("id") UUID id) {
        VerificationResponse response = verificationService.getVerificationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<VerificationResponse> getVerificationStatus(@PathVariable("id") UUID id) {
        VerificationResponse response = verificationService.getVerificationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<VerificationResponse>> listVerifications(@RequestParam(value = "userId", required = false) UUID userId,
                                                                        Authentication authentication) {
        if (userId != null) {
            return ResponseEntity.ok(verificationService.getVerificationsForUser(userId));
        }
        if (authentication != null && authentication.getName() != null) {
            User user = authService.getUserByEmail(authentication.getName());
            if ("CUSTOMER".equals(user.getRole())) {
                return ResponseEntity.ok(verificationService.getVerificationsForUser(user.getId()));
            }
        }
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }
}
