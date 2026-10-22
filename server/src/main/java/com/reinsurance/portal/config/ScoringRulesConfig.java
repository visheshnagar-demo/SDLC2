package com.reinsurance.portal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "app.scoring")
public class ScoringRulesConfig {

    private Map<String, LineRules> rulesByLine = new HashMap<>();

    public ScoringRulesConfig() {
        // Initialize default rules for the 5 specialty lines
        rulesByLine.put("CYBER_RISK", new LineRules("Cyber Risk", Map.of(
            "mfa", 20,
            "edr", 15,
            "immutableBackups", 15,
            "priorLosses", 30,
            "securityTraining", 20
        )));

        rulesByLine.put("DIRECTORS_AND_OFFICERS", new LineRules("Directors & Officers (D&O)", Map.of(
            "financialStrength", 30,
            "claimsHistory", 30,
            "boardGovernance", 20,
            "marketCapitalization", 20
        )));

        rulesByLine.put("ERRORS_AND_OMISSIONS", new LineRules("Errors & Omissions (E&O)", Map.of(
            "qualityControls", 30,
            "priorLossRatio", 30,
            "contractReviewProcess", 20,
            "employeeExperience", 20
        )));

        rulesByLine.put("EMPLOYMENT_PRACTICES_LIABILITY", new LineRules("Employment Practices Liability (EPLI)", Map.of(
            "hrPoliciesAndHandbooks", 25,
            "severanceAndTerminationProtocols", 25,
            "pastEpliClaims", 30,
            "annualTraining", 20
        )));

        rulesByLine.put("MEDICAL_PROFESSIONAL_LIABILITY", new LineRules("Medical Professional Liability", Map.of(
            "credentialingProcess", 30,
            "incidentReportingSystem", 25,
            "lossHistory", 30,
            "accreditationStatus", 15
        )));
    }

    public Map<String, LineRules> getRulesByLine() {
        return rulesByLine;
    }

    public void setRulesByLine(Map<String, LineRules> rulesByLine) {
        this.rulesByLine = rulesByLine;
    }

    public static class LineRules {
        private String lineName;
        private Map<String, Integer> factorWeights;

        public LineRules() {}

        public LineRules(String lineName, Map<String, Integer> factorWeights) {
            this.lineName = lineName;
            this.factorWeights = factorWeights;
        }

        public String getLineName() {
            return lineName;
        }

        public void setLineName(String lineName) {
            this.lineName = lineName;
        }

        public Map<String, Integer> getFactorWeights() {
            return factorWeights;
        }

        public void setFactorWeights(Map<String, Integer> factorWeights) {
            this.factorWeights = factorWeights;
        }
    }
}
