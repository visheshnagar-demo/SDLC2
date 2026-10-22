package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.CreateSubmissionRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ValidationServiceTest {

    private ValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new ValidationService();
    }

    @Test
    @DisplayName("Should pass valid submission parameters")
    void testValidSubmission() {
        CreateSubmissionRequest request = new CreateSubmissionRequest(
            "Travelers Insurance",
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
            Map.of("hasMfa", true)
        );

        List<String> errors = validationService.validateSubmission(request);
        assertThat(errors).isEmpty();
    }

    @Test
    @DisplayName("Should flag error when policy limit is less than or equal to attachment point")
    void testLimitLessThanAttachmentPoint() {
        CreateSubmissionRequest request = new CreateSubmissionRequest(
            "Travelers Insurance",
            "Apex Cybernetics Corp",
            "CYBER_RISK",
            new BigDecimal("5000000.00"),
            new BigDecimal("5000000.00"), // Equal
            new BigDecimal("500000.00"),
            new BigDecimal("150000.00"),
            LocalDate.of(2026, 6, 1),
            LocalDate.of(2027, 6, 1),
            "Technology / SaaS",
            "$50M - $100M",
            "US - Delaware",
            Map.of()
        );

        List<String> errors = validationService.validateSubmission(request);
        assertThat(errors).isNotEmpty();
        assertThat(errors).anyMatch(e -> e.contains("must strictly exceed attachment point"));
    }

    @Test
    @DisplayName("Should flag error when effective date is after expiry date")
    void testInvalidDates() {
        CreateSubmissionRequest request = new CreateSubmissionRequest(
            "Travelers Insurance",
            "Apex Cybernetics Corp",
            "CYBER_RISK",
            new BigDecimal("10000000.00"),
            new BigDecimal("5000000.00"),
            new BigDecimal("500000.00"),
            new BigDecimal("150000.00"),
            LocalDate.of(2027, 6, 1),
            LocalDate.of(2026, 6, 1), // Before effective
            "Technology / SaaS",
            "$50M - $100M",
            "US - Delaware",
            Map.of()
        );

        List<String> errors = validationService.validateSubmission(request);
        assertThat(errors).isNotEmpty();
        assertThat(errors).anyMatch(e -> e.contains("Effective date must be strictly before expiry date"));
    }

    @Test
    @DisplayName("Should detect missing documents by Line of Business")
    void testDocumentCompleteness() {
        List<String> missingCyber = validationService.checkDocumentCompleteness("CYBER_RISK", List.of("APPLICATION"));
        assertThat(missingCyber).containsExactly("LOSS_RUNS");

        List<String> completeCyber = validationService.checkDocumentCompleteness("CYBER_RISK", List.of("APPLICATION", "LOSS_RUNS"));
        assertThat(completeCyber).isEmpty();

        List<String> missingDo = validationService.checkDocumentCompleteness("DIRECTORS_AND_OFFICERS", List.of("APPLICATION"));
        assertThat(missingDo).containsExactly("FINANCIAL_STATEMENTS");
    }
}
