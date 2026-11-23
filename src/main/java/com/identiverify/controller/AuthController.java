package com.identiverify.controller;

import com.identiverify.dto.AuthRequest;
import com.identiverify.dto.AuthResponse;
import com.identiverify.dto.RegisterRequest;
import com.identiverify.entity.User;
import com.identiverify.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = authService.getUserByEmail(authentication.getName());
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("fullName", user.getFullName());
        profile.put("role", user.getRole());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("dateOfBirth", user.getDateOfBirth());
        profile.put("address", user.getAddress());
        profile.put("taxId", user.getTaxId());
        profile.put("status", user.getStatus());
        profile.put("isActive", user.isActive());
        profile.put("isVerified", user.isVerified());
        return ResponseEntity.ok(profile);
    }
}
