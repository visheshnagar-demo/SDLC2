package com.reinsurance.portal.service;

import com.reinsurance.portal.config.ScoringRulesConfig;
import com.reinsurance.portal.dto.RiskScoreResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RiskScoringEngineTest {

    private RiskScoringEngine scoringEngine;

    @BeforeEach
    void setUp() {
        scoringEngine = new RiskScoringEngine(new ScoringRulesConfig());
    }

    @Test
    @DisplayName("Should score Cyber Risk with full controls as LOW risk")
    void testCyberRiskScoringLowRisk() {
        UUID subId = UUID.randomUUID();
        Map<String, Object> attrs = Map.of(
            "hasMfa", true,
            "hasEdr", true,
            "hasImmutableBackups", true,
            "priorLossCount", 0,
            "hasSecurityTraining", true
        );

        RiskScoreResponse score = scoringEngine.scoreSubmission(subId, "CYBER_RISK", attrs);

        assertThat(score.compositeScore()).isEqualTo(100);
        assertThat(score.riskTier()).isEqualTo("LOW");
        assertThat(score.factorBreakdown()).hasSize(5);
    }

    @Test
    @DisplayName("Should score Cyber Risk with zero controls and multiple claims as ELEVATED risk")
    void testCyberRiskScoringElevatedRisk() {
        UUID subId = UUID.randomUUID();
        Map<String, Object> attrs = Map.of(
            "hasMfa", false,
            "hasEdr", false,
            "hasImmutableBackups", false,
            "priorLossCount", 3,
            "hasSecurityTraining", false
        );

        RiskScoreResponse score = scoringEngine.scoreSubmission(subId, "CYBER_RISK", attrs);

        assertThat(score.compositeScore()).isEqualTo(0);
        assertThat(score.riskTier()).isEqualTo("ELEVATED");
    }

    @Test
    @DisplayName("Should correctly evaluate D&O risk parameters")
    void testDirectorsAndOfficersScoring() {
        UUID subId = UUID.randomUUID();
        Map<String, Object> attrs = Map.of(
            "strongFinancials", true,
            "priorLossCount", 0,
            "independentBoard", true,
            "stableMarketCap", true
        );

        RiskScoreResponse score = scoringEngine.scoreSubmission(subId, "DIRECTORS_AND_OFFICERS", attrs);

        assertThat(score.compositeScore()).isEqualTo(100);
        assertThat(score.riskTier()).isEqualTo("LOW");
        assertThat(score.factorBreakdown()).anyMatch(f -> f.factorName().contains("Board"));
    }
}
