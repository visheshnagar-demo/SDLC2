package com.citidirect.auth.controller;

import com.citidirect.auth.config.JwtTokenProvider;
import com.citidirect.auth.dto.*;
import com.citidirect.auth.entity.User;
import com.citidirect.auth.exception.AuthException;
import com.citidirect.auth.repository.UserRepository;
import com.citidirect.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    private User sampleUser;
    private String validJwtToken;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId("user-test-uuid");
        sampleUser.setEmail("customer@example.com");
        sampleUser.setFullName("Customer User");
        sampleUser.setRole("Customer");
        sampleUser.setActive(true);

        validJwtToken = jwtTokenProvider.generateAccessToken(sampleUser);
    }

    @Test
    void testRegisterEndpointSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("new.user@example.com", "SecurePass123!", "New User");
        UserProfileResponse response = new UserProfileResponse("id-123", "new.user@example.com", "New User", "Customer", true, Instant.now());

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new.user@example.com"))
                .andExpect(jsonPath("$.full_name").value("New User"))
                .andExpect(jsonPath("$.role").value("Customer"))
                .andExpect(jsonPath("$.is_active").value(true));
    }

    @Test
    void testRegisterInvalidPasswordFailsValidation() throws Exception {
        RegisterRequest request = new RegisterRequest("new.user@example.com", "weak", "New User");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLoginEndpointSuccess() throws Exception {
        LoginRequest request = new LoginRequest("customer@example.com", "Password123!");
        UserProfileResponse profile = new UserProfileResponse("user-test-uuid", "customer@example.com", "Customer User", "Customer", true, Instant.now());
        AuthResponse response = new AuthResponse("access-token-123", "refresh-token-456", "Bearer", 900, profile);

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("access-token-123"))
                .andExpect(jsonPath("$.refresh_token").value("refresh-token-456"))
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("customer@example.com"));
    }

    @Test
    void testLoginInvalidCredentialsReturnsUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("customer@example.com", "WrongPassword!");

        when(authService.login(any(LoginRequest.class))).thenThrow(new AuthException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));
    }

    @Test
    void testRefreshEndpointSuccess() throws Exception {
        RefreshRequest request = new RefreshRequest("valid-refresh-token");
        UserProfileResponse profile = new UserProfileResponse("user-test-uuid", "customer@example.com", "Customer User", "Customer", true, Instant.now());
        AuthResponse response = new AuthResponse("new-access-token", "new-refresh-token", "Bearer", 900, profile);

        when(authService.refresh(any(RefreshRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("new-access-token"))
                .andExpect(jsonPath("$.refresh_token").value("new-refresh-token"));
    }

    @Test
    void testLogoutEndpointSuccess() throws Exception {
        LogoutRequest request = new LogoutRequest("some-refresh-token");

        mockMvc.perform(post("/api/v1/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detail").value("Successfully logged out"));
    }

    @Test
    void testGetMeEndpointWithValidToken() throws Exception {
        UserProfileResponse profile = new UserProfileResponse("user-test-uuid", "customer@example.com", "Customer User", "Customer", true, Instant.now());

        when(userRepository.findById("user-test-uuid")).thenReturn(Optional.of(sampleUser));
        when(authService.getProfile(any(User.class))).thenReturn(profile);

        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + validJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("user-test-uuid"))
                .andExpect(jsonPath("$.email").value("customer@example.com"))
                .andExpect(jsonPath("$.role").value("Customer"));
    }

    @Test
    void testGetMeEndpointWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
