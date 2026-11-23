package com.identiverify.controller;

import com.identiverify.dto.AdjudicationRequest;
import com.identiverify.dto.VerificationResponse;
import com.identiverify.entity.User;
import com.identiverify.service.AuthService;
import com.identiverify.service.ComplianceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/compliance")
public class ComplianceController {

    private final ComplianceService complianceService;
    private final AuthService authService;

    public ComplianceController(ComplianceService complianceService, AuthService authService) {
        this.complianceService = complianceService;
        this.authService = authService;
    }

    @GetMapping("/queue")
    public ResponseEntity<List<VerificationResponse>> getComplianceQueue() {
        List<VerificationResponse> queue = complianceService.getFlaggedQueue();
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/adjudicate")
    public ResponseEntity<VerificationResponse> adjudicateVerification(@Valid @RequestBody AdjudicationRequest request,
                                                                       Authentication authentication) {
        UUID officerId = null;
        if (authentication != null && authentication.getName() != null) {
            try {
                User user = authService.getUserByEmail(authentication.getName());
                officerId = user.getId();
            } catch (Exception ignored) {
            }
        }
        VerificationResponse response = complianceService.adjudicate(request, officerId);
        return ResponseEntity.ok(response);
    }
}
