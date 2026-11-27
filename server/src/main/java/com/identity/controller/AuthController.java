package com.identity.controller;

import com.identity.dto.ApiResponse;
import com.identity.dto.AuthResponse;
import com.identity.dto.LoginRequest;
import com.identity.dto.RegisterRequest;
import com.identity.dto.VerifyEmailRequest;
import com.identity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        ApiResponse response = authService.verifyEmail(request.getToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/activate")
    public ResponseEntity<ApiResponse> activate(@Valid @RequestBody VerifyEmailRequest request) {
        ApiResponse response = authService.verifyEmail(request.getToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
