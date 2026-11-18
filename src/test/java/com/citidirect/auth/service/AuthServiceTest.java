package com.citidirect.auth.service;

import com.citidirect.auth.config.JwtTokenProvider;
import com.citidirect.auth.dto.*;
import com.citidirect.auth.entity.RefreshToken;
import com.citidirect.auth.entity.User;
import com.citidirect.auth.exception.AuthException;
import com.citidirect.auth.repository.RefreshTokenRepository;
import com.citidirect.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId("user-1234-uuid");
        sampleUser.setEmail("jane.doe@example.com");
        sampleUser.setFullName("Jane Doe");
        sampleUser.setHashedPassword("encodedPassword123");
        sampleUser.setRole("Customer");
        sampleUser.setActive(true);
        sampleUser.setFailedLoginCount(0);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("jane.doe@example.com", "Password123!", "Jane Doe");

        when(userRepository.existsByEmailIgnoreCase("jane.doe@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserProfileResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jane.doe@example.com", response.getEmail());
        assertEquals("Jane Doe", response.getFullName());
        assertEquals("Customer", response.getRole());
        assertTrue(response.isActive());
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        RegisterRequest request = new RegisterRequest("jane.doe@example.com", "Password123!", "Jane Doe");
        when(userRepository.existsByEmailIgnoreCase("jane.doe@example.com")).thenReturn(true);

        AuthException exception = assertThrows(AuthException.class, () -> authService.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Email is already registered", exception.getMessage());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("jane.doe@example.com", "Password123!");

        when(userRepository.findByEmailIgnoreCase("jane.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123!", "encodedPassword123")).thenReturn(true);
        when(tokenProvider.generateAccessToken(sampleUser)).thenReturn("sample-access-jwt");
        when(tokenProvider.generateRefreshTokenString()).thenReturn("sample-refresh-uuid");
        when(tokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(tokenProvider.getAccessTokenExpirationSeconds()).thenReturn(900L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("sample-access-jwt", response.getAccessToken());
        assertEquals("sample-refresh-uuid", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(900, response.getExpiresIn());
        assertNotNull(response.getUser());
        assertEquals("jane.doe@example.com", response.getUser().getEmail());
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void testLoginInvalidPasswordIncrementsFailCount() {
        LoginRequest request = new LoginRequest("jane.doe@example.com", "WrongPassword!");

        when(userRepository.findByEmailIgnoreCase("jane.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword!", "encodedPassword123")).thenReturn(false);

        AuthException exception = assertThrows(AuthException.class, () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(1, sampleUser.getFailedLoginCount());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    void testAccountLockoutAfterFiveFailedAttempts() {
        sampleUser.setFailedLoginCount(4);
        LoginRequest request = new LoginRequest("jane.doe@example.com", "WrongPassword!");

        when(userRepository.findByEmailIgnoreCase("jane.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword!", "encodedPassword123")).thenReturn(false);

        AuthException exception = assertThrows(AuthException.class, () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertNotNull(sampleUser.getLockedUntil());
        assertTrue(sampleUser.getLockedUntil().isAfter(Instant.now()));
    }

    @Test
    void testLoginWhileAccountLockedThrowsTooManyRequests() {
        sampleUser.setLockedUntil(Instant.now().plusSeconds(600));
        LoginRequest request = new LoginRequest("jane.doe@example.com", "Password123!");

        when(userRepository.findByEmailIgnoreCase("jane.doe@example.com")).thenReturn(Optional.of(sampleUser));

        AuthException exception = assertThrows(AuthException.class, () -> authService.login(request));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exception.getStatus());
    }

    @Test
    void testRefreshTokenSuccess() {
        RefreshRequest request = new RefreshRequest("valid-refresh-token");
        RefreshToken refreshToken = new RefreshToken(sampleUser, "valid-refresh-token", Instant.now().plusSeconds(3600));

        when(refreshTokenRepository.findByToken("valid-refresh-token")).thenReturn(Optional.of(refreshToken));
        when(tokenProvider.generateAccessToken(sampleUser)).thenReturn("new-access-jwt");
        when(tokenProvider.generateRefreshTokenString()).thenReturn("new-refresh-uuid");
        when(tokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(tokenProvider.getAccessTokenExpirationSeconds()).thenReturn(900L);

        AuthResponse response = authService.refresh(request);

        assertNotNull(response);
        assertEquals("new-access-jwt", response.getAccessToken());
        assertEquals("new-refresh-uuid", response.getRefreshToken());
        assertTrue(refreshToken.isRevoked());
    }

    @Test
    void testGetProfileSuccess() {
        when(userRepository.findById("user-1234-uuid")).thenReturn(Optional.of(sampleUser));

        UserProfileResponse response = authService.getProfile(sampleUser);

        assertNotNull(response);
        assertEquals("user-1234-uuid", response.getId());
        assertEquals("jane.doe@example.com", response.getEmail());
    }
}
