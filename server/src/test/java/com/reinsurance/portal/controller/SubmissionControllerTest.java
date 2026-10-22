package com.reinsurance.portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reinsurance.portal.dto.CreateQuoteRequest;
import com.reinsurance.portal.dto.CreateSubmissionRequest;
import com.reinsurance.portal.dto.SubmissionDecisionRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SubmissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("End-to-End Workflow: Create Submission -> Review Queue -> Score -> Quote -> Decision -> Audit Trail")
    void testEndToEndSubmissionWorkflow() throws Exception {
        // 1. Create Submission
        CreateSubmissionRequest createRequest = new CreateSubmissionRequest(
            "Travelers Insurance Co.",
            "Apex Cybernetics Corp",
            "CYBER_RISK",
            new BigDecimal("10000000.00"),
            new BigDecimal("5000000.00"),
            new BigDecimal("500000.00"),
            new BigDecimal("150000.00"),
            LocalDate.of(2026, 6, 1),
            LocalDate.of(2027, 6, 1),
            "Technology / SaaS",
            "$50M - $100M",
            "US - Delaware",
            Map.of("hasMfa", true, "hasEdr", true, "hasImmutableBackups", true, "priorLossCount", 0)
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Id", "cedent-user-1")
                .header("X-User-Role", "ROLE_CEDANT")
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.insuredName").value("Apex Cybernetics Corp"))
            .andExpect(jsonPath("$.lineOfBusiness").value("CYBER_RISK"))
            .andExpect(jsonPath("$.riskScore").isNumber())
            .andExpect(jsonPath("$.isReferred").value(true)) // Limit 10M > 5M
            .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        Map<String, Object> createdMap = objectMapper.readValue(responseBody, Map.class);
        String submissionIdStr = (String) createdMap.get("id");
        UUID submissionId = UUID.fromString(submissionIdStr);

        // 2. Query Underwriter Review Queue
        mockMvc.perform(get("/api/v1/submissions")
                .param("lineOfBusiness", "CYBER_RISK")
                .header("X-User-Role", "ROLE_UNDERWRITER"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.totalElements").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        // 3. Get Submission Details & Risk Factors
        mockMvc.perform(get("/api/v1/submissions/" + submissionId)
                .header("X-User-Role", "ROLE_UNDERWRITER"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.riskFactors").isArray())
            .andExpect(jsonPath("$.slaIndicator").exists());

        // 4. Create Reinsurance Quote
        CreateQuoteRequest quoteRequest = new CreateQuoteRequest(
            new BigDecimal("50.00"),
            new BigDecimal("20.00"),
            null,
            "Subject to MFA verification",
            "Standard Cyber Exclusion Clause 2026",
            "War & Infrastructure Grid Failure Exclusion"
        );

        mockMvc.perform(post("/api/v1/submissions/" + submissionId + "/quotes")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Id", "underwriter-1")
                .header("X-User-Role", "ROLE_UNDERWRITER")
                .content(objectMapper.writeValueAsString(quoteRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.quote").exists())
            .andExpect(jsonPath("$.quote.shareOfferedPercentage").value(50.00))
            .andExpect(jsonPath("$.quote.calculatedReinsurancePremium").value(75000.00))
            .andExpect(jsonPath("$.quote.netReinsurancePremium").value(60000.00));

        // 5. Manager Referral Decision (Approve)
        mockMvc.perform(post("/api/v1/submissions/" + submissionId + "/referral/decision")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Id", "manager-1")
                .header("X-User-Role", "ROLE_MANAGER")
                .content(objectMapper.writeValueAsString(Map.of(
                    "decision", "APPROVE",
                    "managerNotes", "Approved exception for top-tier client",
                    "approvedLimit", 10000000.00
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isReferred").value(false));

        // 6. Transition Status to BOUND
        SubmissionDecisionRequest decisionRequest = new SubmissionDecisionRequest(
            "BOUND",
            null,
            "Signed binder agreement executed by Cedent",
            new BigDecimal("10000000.00")
        );

        mockMvc.perform(patch("/api/v1/submissions/" + submissionId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Id", "underwriter-1")
                .header("X-User-Role", "ROLE_UNDERWRITER")
                .content(objectMapper.writeValueAsString(decisionRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("BOUND"));

        // 7. Verify Audit Trail
        mockMvc.perform(get("/api/v1/submissions/" + submissionId + "/audit-trail")
                .header("X-User-Role", "ROLE_UNDERWRITER"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(4)));

        // 8. Verify Dashboard Metrics
        mockMvc.perform(get("/api/v1/dashboard/metrics")
                .header("X-User-Role", "ROLE_MANAGER"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalSubmissions").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.quoteToBindRatioPercentage").exists())
            .andExpect(jsonPath("$.submissionsByLine").exists());
    }

    @Test
    @DisplayName("Should reject submission with invalid limit/attachment point")
    void testInvalidSubmissionRejected() throws Exception {
        CreateSubmissionRequest invalidRequest = new CreateSubmissionRequest(
            "Travelers Insurance Co.",
            "Apex Cybernetics Corp",
            "CYBER_RISK",
            new BigDecimal("5000000.00"),
            new BigDecimal("10000000.00"), // Attachment exceeds limit
            new BigDecimal("500000.00"),
            new BigDecimal("150000.00"),
            LocalDate.of(2026, 6, 1),
            LocalDate.of(2027, 6, 1),
            "Technology / SaaS",
            "$50M - $100M",
            "US - Delaware",
            Map.of()
        );

        mockMvc.perform(post("/api/v1/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("must strictly exceed attachment point")));
    }

    @Test
    @DisplayName("Should require decline reason when transitioning to DECLINED")
    void testDeclineReasonMandatory() throws Exception {
        CreateSubmissionRequest createRequest = new CreateSubmissionRequest(
            "Chubb Group",
            "MedTech Diagnostics LLC",
            "MEDICAL_PROFESSIONAL_LIABILITY",
            new BigDecimal("3000000.00"),
            new BigDecimal("1000000.00"),
            new BigDecimal("250000.00"),
            new BigDecimal("80000.00"),
            LocalDate.of(2026, 7, 1),
            LocalDate.of(2027, 7, 1),
            "Healthcare",
            "$20M - $50M",
            "US - New York",
            Map.of()
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/submissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();

        Map<String, Object> createdMap = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        String submissionId = (String) createdMap.get("id");

        SubmissionDecisionRequest invalidDecline = new SubmissionDecisionRequest(
            "DECLINED",
            "", // Empty decline reason
            "No notes",
            null
        );

        mockMvc.perform(patch("/api/v1/submissions/" + submissionId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDecline)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Mandatory decline reason is required")));
    }
}
