package com.identiverify.service;

import com.identiverify.config.JwtTokenProvider;
import com.identiverify.dto.AuthRequest;
import com.identiverify.dto.AuthResponse;
import com.identiverify.dto.RegisterRequest;
import com.identiverify.entity.User;
import com.identiverify.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists");
        }

        String role = (request.getRole() != null && !request.getRole().isBlank()) ? request.getRole().toUpperCase() : "CUSTOMER";
        if (!role.equals("CUSTOMER") && !role.equals("COMPLIANCE_OFFICER") && !role.equals("ADMIN")) {
            role = "CUSTOMER";
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());
        user.setTaxId(request.getTaxId());
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setActive(true);
        user.setVerified(true);

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        auditService.logEvent(
                "User",
                savedUser.getId(),
                savedUser.getId(),
                savedUser.getEmail(),
                "USER_REGISTERED",
                null,
                "{\"email\":\"" + savedUser.getEmail() + "\",\"role\":\"" + savedUser.getRole() + "\"}",
                "127.0.0.1"
        );

        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole());
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        auditService.logEvent(
                "User",
                user.getId(),
                user.getId(),
                user.getEmail(),
                "USER_LOGIN",
                null,
                "{\"status\":\"SUCCESS\"}",
                "127.0.0.1"
        );

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    @Transactional(readOnly = true)
    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));
    }
}
