package com.citidirect.auth.controller;

import com.citidirect.auth.dto.*;
import com.citidirect.auth.entity.User;
import com.citidirect.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Customer Registration, Authentication and Session Management APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer account")
    public ResponseEntity<UserProfileResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserProfileResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and issue JWT access and refresh tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a valid refresh token for a new access token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke active refresh token and invalidate access session")
    public ResponseEntity<MessageResponse> logout(
            @RequestBody(required = false) LogoutRequest request,
            @AuthenticationPrincipal User currentUser) {
        authService.logout(request, currentUser);
        return ResponseEntity.ok(new MessageResponse("Successfully logged out", "Successfully logged out"));
    }

    @GetMapping("/me")
    @Operation(summary = "Retrieve authenticated user's profile and active status", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        UserProfileResponse profile = authService.getProfile(currentUser);
        return ResponseEntity.ok(profile);
    }
}
