package com.citidirect.auth.service;

import com.citidirect.auth.config.JwtTokenProvider;
import com.citidirect.auth.dto.*;
import com.citidirect.auth.entity.RefreshToken;
import com.citidirect.auth.entity.User;
import com.citidirect.auth.exception.AuthException;
import com.citidirect.auth.repository.RefreshTokenRepository;
import com.citidirect.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new AuthException("Email is already registered", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFullName(request.getFullName().trim());
        user.setHashedPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("Customer");
        user.setActive(true);
        user.setFailedLoginCount(0);

        User savedUser = userRepository.save(user);
        return UserProfileResponse.fromEntity(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new AuthException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (user.getLockedUntil() != null && Instant.now().isBefore(user.getLockedUntil())) {
            throw new AuthException("Account is temporarily locked due to consecutive failed attempts. Please try again later.", HttpStatus.TOO_MANY_REQUESTS);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
            int failedAttempts = user.getFailedLoginCount() + 1;
            user.setFailedLoginCount(failedAttempts);
            if (failedAttempts >= 5) {
                user.setLockedUntil(Instant.now().plusSeconds(900)); // 15 min lock
                user.setFailedLoginCount(0);
            }
            userRepository.save(user);
            throw new AuthException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Reset lockout counters upon successful login
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshTokenString = tokenProvider.generateRefreshTokenString();
        Instant refreshExpiry = Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs());

        RefreshToken refreshToken = new RefreshToken(user, refreshTokenString, refreshExpiry);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshTokenString,
                "Bearer",
                (int) tokenProvider.getAccessTokenExpirationSeconds(),
                UserProfileResponse.fromEntity(user)
        );
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String tokenStr = request.getRefreshToken();
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new AuthException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED));

        if (refreshToken.isRevoked() || refreshToken.isExpired()) {
            throw new AuthException("Refresh token has been revoked or expired", HttpStatus.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        if (!user.isActive()) {
            throw new AuthException("User account is inactive", HttpStatus.UNAUTHORIZED);
        }

        // Rotate token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        String newAccessToken = tokenProvider.generateAccessToken(user);
        String newRefreshTokenString = tokenProvider.generateRefreshTokenString();
        Instant refreshExpiry = Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs());

        RefreshToken newRefreshToken = new RefreshToken(user, newRefreshTokenString, refreshExpiry);
        refreshTokenRepository.save(newRefreshToken);

        return new AuthResponse(
                newAccessToken,
                newRefreshTokenString,
                "Bearer",
                (int) tokenProvider.getAccessTokenExpirationSeconds(),
                UserProfileResponse.fromEntity(user)
        );
    }

    @Transactional
    public void logout(LogoutRequest request, User currentUser) {
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            refreshTokenRepository.findByToken(request.getRefreshToken())
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }
        if (currentUser != null) {
            refreshTokenRepository.revokeAllUserTokens(currentUser);
        }
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User currentUser) {
        if (currentUser == null) {
            throw new AuthException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AuthException("User not found", HttpStatus.NOT_FOUND));
        return UserProfileResponse.fromEntity(user);
    }
}
