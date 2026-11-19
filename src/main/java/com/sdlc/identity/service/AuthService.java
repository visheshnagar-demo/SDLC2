package com.sdlc.identity.service;

import com.sdlc.identity.dto.*;
import com.sdlc.identity.model.Role;
import com.sdlc.identity.model.User;
import com.sdlc.identity.model.UserStatus;
import com.sdlc.identity.repository.UserRepository;
import com.sdlc.identity.security.JwtTokenProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // Minimum 8 characters, at least one letter and at least one digit or special character
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$");

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("User with email already exists: " + email);
        }

        validatePassword(request.getPassword());

        String fullName = request.getFullName();
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = "Customer";
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(fullName.trim());
        user.setRole(Role.ROLE_CUSTOMER);
        user.setStatus(UserStatus.APPROVED);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getId(), savedUser.getEmail());

        UserResponse userResponse = mapToUserResponse(savedUser);
        return new AuthResponse(accessToken, refreshToken, "Bearer", 3600L, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        UserResponse userResponse = mapToUserResponse(user);
        return new AuthResponse(accessToken, refreshToken, "Bearer", 3600L, userResponse);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String token = request.getRefreshToken();
        if (token == null || token.trim().isEmpty() || !jwtTokenProvider.validateToken(token)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        UserResponse userResponse = mapToUserResponse(user);
        return new AuthResponse(newAccessToken, newRefreshToken, "Bearer", 3600L, userResponse);
    }

    public UserResponse getMe(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        return mapToUserResponse(user);
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8 || !PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("Password must be at least 8 characters long and contain both letters and numbers/special characters.");
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
