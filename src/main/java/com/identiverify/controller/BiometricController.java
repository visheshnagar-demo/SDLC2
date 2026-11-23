package com.identiverify.controller;

import com.identiverify.dto.BiometricCheckRequest;
import com.identiverify.dto.BiometricCheckResponse;
import com.identiverify.service.BiometricService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/biometrics")
public class BiometricController {

    private final BiometricService biometricService;

    public BiometricController(BiometricService biometricService) {
        this.biometricService = biometricService;
    }

    @PostMapping("/liveness-check")
    public ResponseEntity<BiometricCheckResponse> performLivenessCheck(@Valid @RequestBody BiometricCheckRequest request) {
        BiometricCheckResponse response = biometricService.processLivenessAndMatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/verification/{verificationId}")
    public ResponseEntity<BiometricCheckResponse> getBiometricCheck(@PathVariable("verificationId") UUID verificationId) {
        return biometricService.getBiometricCheckByVerificationId(verificationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
