package com.identiverify;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.identiverify.dto.AdjudicationRequest;
import com.identiverify.dto.VerificationResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ComplianceAndAuditTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testComplianceQueueAndAdjudication() throws Exception {
        // 1. Create a verification request
        MvcResult initResult = mockMvc.perform(post("/api/v1/verifications")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        VerificationResponse initResponse = objectMapper.readValue(
                initResult.getResponse().getContentAsString(), VerificationResponse.class);
        UUID verificationId = initResponse.getId();

        // 2. Fetch Compliance Queue
        mockMvc.perform(get("/api/v1/compliance/queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 3. Adjudicate
        AdjudicationRequest adjRequest = new AdjudicationRequest(
                verificationId, "APPROVED", "Manual review completed. Identity and documents verified successfully.");

        mockMvc.perform(post("/api/v1/compliance/adjudicate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adjRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(verificationId.toString()))
                .andExpect(jsonPath("$.status").value("MANUALLY_APPROVED"))
                .andExpect(jsonPath("$.manualDecision").value("APPROVED"))
                .andExpect(jsonPath("$.decisionNotes").isNotEmpty());

        // 4. Query Audit Logs
        mockMvc.perform(get("/api/v1/audit/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].hashChain").isNotEmpty());
    }
}
