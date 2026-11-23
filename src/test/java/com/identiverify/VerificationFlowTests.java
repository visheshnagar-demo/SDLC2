package com.identiverify;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.identiverify.dto.BiometricCheckRequest;
import com.identiverify.dto.DocumentUploadRequest;
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
class VerificationFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testEndToEndVerificationFlow() throws Exception {
        // 1. Initiate Verification
        MvcResult initResult = mockMvc.perform(post("/api/v1/verifications")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("INITIATED"))
                .andReturn();

        VerificationResponse initResponse = objectMapper.readValue(
                initResult.getResponse().getContentAsString(), VerificationResponse.class);
        UUID verificationId = initResponse.getId();
        assertNotNull(verificationId);

        // 2. Upload Document & Extract OCR
        DocumentUploadRequest docRequest = new DocumentUploadRequest();
        docRequest.setVerificationId(verificationId);
        docRequest.setDocumentType("PASSPORT");
        docRequest.setIssuingCountry("USA");
        docRequest.setFileFront("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        mockMvc.perform(post("/api/v1/documents/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.documentId").isNotEmpty())
                .andExpect(jsonPath("$.documentType").value("PASSPORT"))
                .andExpect(jsonPath("$.documentNumber").isNotEmpty())
                .andExpect(jsonPath("$.ocrConfidenceScore").isNumber());

        // 3. Biometric Liveness & Facial Comparison
        BiometricCheckRequest bioRequest = new BiometricCheckRequest();
        bioRequest.setVerificationId(verificationId);
        bioRequest.setSelfieBase64("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        mockMvc.perform(post("/api/v1/biometrics/liveness-check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bioRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.checkId").isNotEmpty())
                .andExpect(jsonPath("$.livenessStatus").value("PASSED"))
                .andExpect(jsonPath("$.matchStatus").value("MATCHED"))
                .andExpect(jsonPath("$.verificationStatus").value("AUTO_APPROVED"));

        // 4. Retrieve Verification Status
        mockMvc.perform(get("/api/v1/verifications/" + verificationId + "/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(verificationId.toString()))
                .andExpect(jsonPath("$.status").value("AUTO_APPROVED"))
                .andExpect(jsonPath("$.documents").isArray())
                .andExpect(jsonPath("$.biometricCheck").isNotEmpty());
    }
}
