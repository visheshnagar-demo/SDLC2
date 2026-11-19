package com.sdlc.identity.service;

import com.sdlc.identity.dto.AuthResponse;
import com.sdlc.identity.dto.LoginRequest;
import com.sdlc.identity.dto.RefreshRequest;
import com.sdlc.identity.dto.RegisterRequest;
import com.sdlc.identity.dto.UserResponse;
import com.sdlc.identity.exception.GlobalExceptionHandler.AccountDisabledException;
import com.sdlc.identity.exception.GlobalExceptionHandler.DuplicateEmailException;
import com.sdlc.identity.exception.GlobalExceptionHandler.InvalidCredentialsException;
import com.sdlc.identity.exception.GlobalExceptionHandler.InvalidTokenException;
import com.sdlc.identity.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.sdlc.identity.model.Role;
import com.sdlc.identity.model.User;
import com.sdlc.identity.model.UserStatus;
import com.sdlc.identity.repository.UserRepository;
import com.sdlc.identity.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("Email address is already registered: " + normalizedEmail);
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_CUSTOMER);
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return UserResponse.fromEntity(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new AccountDisabledException("User account is disabled");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        long expiresIn = jwtTokenProvider.getAccessTokenExpirationSeconds();

        return new AuthResponse(
                accessToken,
                refreshToken,
                expiresIn,
                UserResponse.fromEntity(user)
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshRequest request) {
        String token = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(token)) {
            throw new InvalidTokenException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        if (email == null) {
            throw new InvalidTokenException("Token does not contain valid user information");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidTokenException("User associated with token not found"));

        if (!user.isActive()) {
            throw new AccountDisabledException("User account is disabled");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        long expiresIn = jwtTokenProvider.getAccessTokenExpirationSeconds();

        return new AuthResponse(
                newAccessToken,
                token,
                expiresIn,
                UserResponse.fromEntity(user)
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return UserResponse.fromEntity(user);
    }
}
