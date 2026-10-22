package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.RiskScoreResponse;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.RiskFactorBreakdownRepository;
import com.reinsurance.portal.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class RiskScoringEngineTest {

    private SubmissionRepository submissionRepository;
    private RiskFactorBreakdownRepository factorBreakdownRepository;
    private RiskScoringEngine scoringEngine;

    @BeforeEach
    void setUp() {
        submissionRepository = Mockito.mock(SubmissionRepository.class);
        factorBreakdownRepository = Mockito.mock(RiskFactorBreakdownRepository.class);
        scoringEngine = new RiskScoringEngine(submissionRepository, factorBreakdownRepository);
    }

    @Test
    void testCyberScoringWithFullControls() {
        SubmissionEntity submission = new SubmissionEntity();
        submission.setId(UUID.randomUUID());
        submission.setLineOfBusiness("Cyber Risk");
        submission.setPolicyLimit(BigDecimal.valueOf(10000000));
        submission.setAttachmentPoint(BigDecimal.valueOf(5000000));
        submission.setGrossPremium(BigDecimal.valueOf(150000));
        submission.setEffectiveDate(LocalDate.now());
        submission.setExpiryDate(LocalDate.now().plusYears(1));

        when(submissionRepository.save(any(SubmissionEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        Map<String, Object> attrs = Map.of(
                "hasMfa", true,
                "hasEdr", true,
                "hasBackups", true,
                "priorLossCount", 0,
                "hasTraining", true
        );

        RiskScoreResponse response = scoringEngine.scoreSubmission(submission, attrs);

        assertEquals(100, response.compositeScore());
        assertEquals("LOW", response.riskTier());
        assertEquals(5, response.factorBreakdown().size());
    }

    @Test
    void testCyberScoringWithDeficits() {
        SubmissionEntity submission = new SubmissionEntity();
        submission.setId(UUID.randomUUID());
        submission.setLineOfBusiness("Cyber Risk");
        submission.setPolicyLimit(BigDecimal.valueOf(10000000));
        submission.setAttachmentPoint(BigDecimal.valueOf(5000000));

        when(submissionRepository.save(any(SubmissionEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        Map<String, Object> attrs = Map.of(
                "hasMfa", false,
                "hasEdr", false,
                "hasBackups", false,
                "priorLossCount", 5,
                "hasTraining", false
        );

        RiskScoreResponse response = scoringEngine.scoreSubmission(submission, attrs);

        assertEquals(0, response.compositeScore());
        assertEquals("HIGH", response.riskTier());
    }
}
