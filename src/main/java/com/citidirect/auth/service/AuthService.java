package com.citidirect.auth.service;

import com.citidirect.auth.config.JwtTokenProvider;
import com.citidirect.auth.dto.*;
import com.citidirect.auth.entity.RefreshToken;
import com.citidirect.auth.entity.User;
import com.citidirect.auth.repository.RefreshTokenRepository;
import com.citidirect.auth.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$");

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

    @PostConstruct
    public void seedDefaultUsers() {
        if (!userRepository.existsByEmail("test@example.com")) {
            User testUser = new User();
            testUser.setId(UUID.randomUUID().toString());
            testUser.setEmail("test@example.com");
            testUser.setPasswordHash(passwordEncoder.encode("testpassword"));
            testUser.setFullName("Test User");
            testUser.setRole("ROLE_USER");
            testUser.setActive(true);
            testUser.setCreatedAt(Instant.now());
            testUser.setUpdatedAt(Instant.now());
            userRepository.save(testUser);
        }

        if (!userRepository.existsByEmail("admin@example.com")) {
            User adminUser = new User();
            adminUser.setId(UUID.randomUUID().toString());
            adminUser.setEmail("admin@example.com");
            adminUser.setPasswordHash(passwordEncoder.encode("adminpassword"));
            adminUser.setFullName("Admin User");
            adminUser.setRole("ROLE_ADMIN");
            adminUser.setActive(true);
            adminUser.setCreatedAt(Instant.now());
            adminUser.setUpdatedAt(Instant.now());
            userRepository.save(adminUser);
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty() ||
            request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required registration fields are missing or empty");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }

        String password = request.getPassword();
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User with email already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(request.getFullName().trim());
        user.setRole("ROLE_USER");
        user.setActive(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        user = userRepository.save(user);

        return createAuthResponseForUser(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Email and password must be provided");
        }

        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is disabled");
        }

        return createAuthResponseForUser(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String tokenStr = request.getRefreshToken();
        if (tokenStr == null || tokenStr.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token is required");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        User user = refreshToken.getUser();
        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        UserProfileResponse userProfile = toUserProfileResponse(user);

        return new AuthResponse(
                newAccessToken,
                tokenStr,
                tokenProvider.getAccessTokenExpirationMs() / 1000,
                userProfile
        );
    }

    @Transactional
    public void logout(User user) {
        if (user != null) {
            refreshTokenRepository.deleteByUser(user);
        }
    }

    public UserProfileResponse getProfile(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return toUserProfileResponse(user);
    }

    public UserProfileResponse getProfileById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserProfileResponse(user);
    }

    private AuthResponse createAuthResponseForUser(User user) {
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshTokenStr = tokenProvider.generateRefreshToken(user.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setId(UUID.randomUUID().toString());
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs()));
        refreshToken.setCreatedAt(Instant.now());
        refreshTokenRepository.save(refreshToken);

        UserProfileResponse userProfile = toUserProfileResponse(user);

        return new AuthResponse(
                accessToken,
                refreshTokenStr,
                tokenProvider.getAccessTokenExpirationMs() / 1000,
                userProfile
        );
    }

    public UserProfileResponse toUserProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
