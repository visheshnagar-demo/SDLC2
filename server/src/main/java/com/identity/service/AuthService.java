package com.identity.service;

import com.identity.dto.ApiResponse;
import com.identity.dto.AuthResponse;
import com.identity.dto.LoginRequest;
import com.identity.dto.RegisterRequest;
import com.identity.model.User;
import com.identity.model.UserProfile;
import com.identity.model.VerificationToken;
import com.identity.repository.UserProfileRepository;
import com.identity.repository.UserRepository;
import com.identity.repository.VerificationTokenRepository;
import com.identity.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       VerificationTokenRepository verificationTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @Transactional
    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus("PENDING_VERIFICATION");
        user.setEmailVerified(false);
        user.setRole("ROLE_CUSTOMER");

        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhoneNumber(request.getPhoneNumber());
        userProfileRepository.save(profile);

        // Generate verification token (expires in 24 hours)
        String tokenStr = UUID.randomUUID().toString();
        VerificationToken token = new VerificationToken();
        token.setUser(user);
        token.setToken(tokenStr);
        token.setTokenType("ACTIVATION");
        token.setExpiresAt(OffsetDateTime.now().plusHours(24));
        verificationTokenRepository.save(token);

        emailService.sendActivationEmail(user.getEmail(), tokenStr);

        return new ApiResponse(
                user.getId(),
                user.getEmail(),
                user.getStatus(),
                "Registration successful. Please check your email to activate your account."
        );
    }

    @Transactional
    public ApiResponse verifyEmail(String tokenStr) {
        VerificationToken token = verificationTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or unknown verification token"));

        if (token.getUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token has already been used");
        }

        if (token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token has expired");
        }

        token.setUsedAt(OffsetDateTime.now());
        verificationTokenRepository.save(token);

        User user = token.getUser();
        user.setStatus("ACTIVE");
        user.setEmailVerified(true);
        userRepository.save(user);

        return new ApiResponse(user.getId(), user.getEmail(), user.getStatus(), "Account activated successfully. You can now log in.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified()) && !"ACTIVE".equals(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account is not verified. Please activate via email link.");
        }

        String accessToken = tokenProvider.generateToken(user.getEmail(), user.getId(), user.getRole());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken, refreshToken, "Bearer", 900);
    }
}
