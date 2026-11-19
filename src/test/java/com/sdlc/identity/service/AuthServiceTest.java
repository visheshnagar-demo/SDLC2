package com.sdlc.identity.service;

import com.sdlc.identity.dto.AuthResponse;
import com.sdlc.identity.dto.LoginRequest;
import com.sdlc.identity.dto.RegisterRequest;
import com.sdlc.identity.dto.UserResponse;
import com.sdlc.identity.exception.GlobalExceptionHandler.DuplicateEmailException;
import com.sdlc.identity.exception.GlobalExceptionHandler.InvalidCredentialsException;
import com.sdlc.identity.model.Role;
import com.sdlc.identity.model.User;
import com.sdlc.identity.model.UserStatus;
import com.sdlc.identity.repository.UserRepository;
import com.sdlc.identity.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtTokenProvider);
    }

    @Test
    @DisplayName("Should successfully register user")
    void testRegisterUserSuccess() {
        RegisterRequest request = new RegisterRequest("unit@example.com", "Password123!", "Unit User");

        when(userRepository.existsByEmail("unit@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword123");

        User savedUser = new User("unit@example.com", "hashedPassword123", "Unit User", Role.ROLE_CUSTOMER, UserStatus.PENDING_VERIFICATION);
        savedUser.setId(UUID.randomUUID());
        savedUser.setCreatedAt(Instant.now());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("unit@example.com");
        assertThat(response.getFullName()).isEqualTo("Unit User");
        assertThat(response.getRole()).isEqualTo("ROLE_CUSTOMER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateEmailException when email exists")
    void testRegisterDuplicateEmailThrows() {
        RegisterRequest request = new RegisterRequest("exists@example.com", "Password123!", "Existing User");
        when(userRepository.existsByEmail("exists@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    @DisplayName("Should login successfully and return tokens")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("user@example.com", "Password123!");

        User user = new User("user@example.com", "hashedPassword123", "Test User", Role.ROLE_CUSTOMER, UserStatus.APPROVED);
        user.setId(UUID.randomUUID());
        user.setActive(true);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "hashedPassword123")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(user)).thenReturn("mock.access.token");
        when(jwtTokenProvider.generateRefreshToken(user)).thenReturn("mock.refresh.token");
        when(jwtTokenProvider.getAccessTokenExpirationSeconds()).thenReturn(900L);

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("mock.access.token");
        assertThat(response.getRefreshToken()).isEqualTo("mock.refresh.token");
        assertThat(response.getUser().getEmail()).isEqualTo("user@example.com");
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when password does not match")
    void testLoginInvalidPasswordThrows() {
        LoginRequest request = new LoginRequest("user@example.com", "WrongPassword");

        User user = new User("user@example.com", "hashedPassword123", "Test User", Role.ROLE_CUSTOMER, UserStatus.APPROVED);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashedPassword123")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
