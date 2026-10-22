package com.reinsurance.portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reinsurance.portal.dto.CreateSubmissionRequest;
import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.repository.SubmissionRepository;
import com.reinsurance.portal.service.*;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SubmissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IntakeService intakeService;

    @MockBean
    private UnderwriterQueueService queueService;

    @MockBean
    private DecisionWorkflowService workflowService;

    @MockBean
    private RiskScoringEngine scoringEngine;

    @MockBean
    private AuditTrailService auditTrailService;

    @MockBean
    private SubmissionRepository submissionRepository;

    @Test
    void testCreateSubmissionEndpoint() throws Exception {
        CreateSubmissionRequest request = new CreateSubmissionRequest(
                "Travelers",
                "Apex Cybernetics",
                "Cyber Risk",
                BigDecimal.valueOf(10000000),
                BigDecimal.valueOf(5000000),
                BigDecimal.valueOf(500000),
                BigDecimal.valueOf(150000),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                "Technology",
                "$50M - $100M",
                "US-NY",
                Map.of("hasMfa", true)
        );

        SubmissionResponse mockResponse = new SubmissionResponse(
                UUID.randomUUID(),
                "Travelers",
                "Apex Cybernetics",
                "Cyber Risk",
                BigDecimal.valueOf(10000000),
                BigDecimal.valueOf(5000000),
                BigDecimal.valueOf(500000),
                BigDecimal.valueOf(150000),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                "Technology",
                "$50M - $100M",
                "US-NY",
                "RECEIVED",
                80,
                "LOW",
                false,
                null,
                "cedant@example.com",
                Instant.now(),
                Instant.now(),
                Map.of("hasMfa", true),
                List.of(),
                List.of(),
                "GREEN",
                0L
        );

        Mockito.when(intakeService.createSubmission(any(CreateSubmissionRequest.class), any(), any()))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.insuredName").value("Apex Cybernetics"))
                .andExpect(jsonPath("$.status").value("RECEIVED"));
    }
}
