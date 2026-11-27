package com.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.identity.dto.UserProfileDto;
import com.identity.model.User;
import com.identity.model.UserProfile;
import com.identity.repository.UserProfileRepository;
import com.identity.repository.UserRepository;
import com.identity.repository.VerificationTokenRepository;
import com.identity.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProfileControllerTest {

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

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private String token;

    @BeforeEach
    void setUp() {
        verificationTokenRepository.deleteAll();
        userProfileRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmail("profile.user@example.com");
        testUser.setPasswordHash(passwordEncoder.encode("StrongPass123!"));
        testUser.setStatus("ACTIVE");
        testUser.setEmailVerified(true);
        testUser.setRole("ROLE_CUSTOMER");
        testUser = userRepository.save(testUser);

        UserProfile profile = new UserProfile();
        profile.setUser(testUser);
        profile.setFirstName("Profile");
        profile.setLastName("Tester");
        profile.setPhoneNumber("+1112223333");
        profile.setDateOfBirth(LocalDate.of(1995, 5, 20));
        profile.setAddressLine1("100 Tech Blvd");
        profile.setCity("San Francisco");
        profile.setStateProvince("CA");
        profile.setPostalCode("94105");
        profile.setCountryCode("USA");
        userProfileRepository.save(profile);

        token = jwtTokenProvider.generateToken(testUser.getEmail(), testUser.getId(), testUser.getRole());
    }

    @Test
    void testGetProfileSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("profile.user@example.com")))
                .andExpect(jsonPath("$.first_name", is("Profile")))
                .andExpect(jsonPath("$.last_name", is("Tester")))
                .andExpect(jsonPath("$.city", is("San Francisco")))
                .andExpect(jsonPath("$.country_code", is("USA")));
    }

    @Test
    void testGetProfileUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateProfileSuccess() throws Exception {
        UserProfileDto updateDto = new UserProfileDto();
        updateDto.setFirstName("UpdatedName");
        updateDto.setPhoneNumber("+9998887777");
        updateDto.setAddressLine1("456 Market St");
        updateDto.setCity("New York");
        updateDto.setStateProvince("NY");
        updateDto.setPostalCode("10001");
        updateDto.setCountryCode("USA");

        mockMvc.perform(put("/api/v1/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.first_name", is("UpdatedName")))
                .andExpect(jsonPath("$.phone_number", is("+9998887777")))
                .andExpect(jsonPath("$.city", is("New York")))
                .andExpect(jsonPath("$.updated_at", notNullValue()));
    }
}
