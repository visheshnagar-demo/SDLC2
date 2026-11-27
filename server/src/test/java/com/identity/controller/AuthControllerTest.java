package com.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.identity.dto.LoginRequest;
import com.identity.dto.RegisterRequest;
import com.identity.dto.VerifyEmailRequest;
import com.identity.model.User;
import com.identity.model.VerificationToken;
import com.identity.repository.UserProfileRepository;
import com.identity.repository.UserRepository;
import com.identity.repository.VerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @BeforeEach
    void setUp() {
        verificationTokenRepository.deleteAll();
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "john.doe@example.com",
                "StrongPass123!",
                "John",
                "Doe",
                "+1234567890"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("john.doe@example.com")))
                .andExpect(jsonPath("$.status", is("PENDING_VERIFICATION")))
                .andExpect(jsonPath("$.user_id", notNullValue()));
    }

    @Test
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "john.duplicate@example.com",
                "StrongPass123!",
                "John",
                "Doe",
                "+1234567890"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testRegisterInvalidPassword() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "john.weak@example.com",
                "weak",
                "John",
                "Doe",
                "+1234567890"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testVerifyEmailAndLogin() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "activation.test@example.com",
                "StrongPass123!",
                "Jane",
                "Smith",
                "+1987654321"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("activation.test@example.com").orElseThrow();
        VerificationToken token = verificationTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow();

        // Login before verification fails
        LoginRequest loginReq = new LoginRequest("activation.test@example.com", "StrongPass123!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());

        // Verify email
        VerifyEmailRequest verifyReq = new VerifyEmailRequest(token.getToken());
        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        // Login after verification succeeds
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token", notNullValue()))
                .andExpect(jsonPath("$.token_type", is("Bearer")));
    }
}
