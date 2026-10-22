package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.CreateSubmissionRequest;
import com.reinsurance.portal.entity.SubmissionDocumentEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ValidationServiceTest {

    private ValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new ValidationService();
    }

    @Test
    void testValidSubmissionPasses() {
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

        List<String> errors = validationService.validateSubmission(request);
        assertTrue(errors.isEmpty(), "Expected no validation errors for valid submission");
    }

    @Test
    void testInvalidDateLogicFails() {
        CreateSubmissionRequest request = new CreateSubmissionRequest(
                "Travelers",
                "Apex Cybernetics",
                "Cyber Risk",
                BigDecimal.valueOf(10000000),
                BigDecimal.valueOf(5000000),
                BigDecimal.valueOf(500000),
                BigDecimal.valueOf(150000),
                LocalDate.now().plusYears(1),
                LocalDate.now(), // Expiry before effective
                "Technology",
                "$50M - $100M",
                "US-NY",
                Map.of()
        );

        List<String> errors = validationService.validateSubmission(request);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("Effective date must be strictly before expiry date")));
    }

    @Test
    void testLimitMustExceedAttachmentPoint() {
        CreateSubmissionRequest request = new CreateSubmissionRequest(
                "Travelers",
                "Apex Cybernetics",
                "Cyber Risk",
                BigDecimal.valueOf(5000000),
                BigDecimal.valueOf(10000000), // Attachment > Limit
                BigDecimal.valueOf(500000),
                BigDecimal.valueOf(150000),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                "Technology",
                "$50M - $100M",
                "US-NY",
                Map.of()
        );

        List<String> errors = validationService.validateSubmission(request);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("Policy limit must be strictly greater than attachment point")));
    }

    @Test
    void testDocumentCompleteness() {
        SubmissionDocumentEntity appDoc = new SubmissionDocumentEntity();
        appDoc.setDocumentType("APPLICATION");

        List<String> missingCyber = validationService.checkDocumentCompleteness("Cyber Risk", List.of(appDoc));
        assertTrue(missingCyber.contains("LOSS_RUNS"), "Cyber requires LOSS_RUNS");

        SubmissionDocumentEntity lossDoc = new SubmissionDocumentEntity();
        lossDoc.setDocumentType("LOSS_RUNS");

        List<String> completeCyber = validationService.checkDocumentCompleteness("Cyber Risk", List.of(appDoc, lossDoc));
        assertTrue(completeCyber.isEmpty(), "Cyber completeness met with APPLICATION and LOSS_RUNS");
    }
}
