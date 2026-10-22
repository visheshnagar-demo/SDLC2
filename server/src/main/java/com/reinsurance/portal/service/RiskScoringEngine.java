package com.reinsurance.portal.service;

import com.reinsurance.portal.config.ScoringRulesConfig;
import com.reinsurance.portal.dto.RiskScoreResponse;
import com.reinsurance.portal.dto.RiskScoreResponse.FactorScoreItem;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class RiskScoringEngine {

    private final ScoringRulesConfig scoringRulesConfig;

    public RiskScoringEngine(ScoringRulesConfig scoringRulesConfig) {
        this.scoringRulesConfig = scoringRulesConfig;
    }

    public RiskScoreResponse scoreSubmission(UUID submissionId, String lineOfBusiness, Map<String, Object> riskAttributes) {
        String normLob = (lineOfBusiness != null) ? lineOfBusiness.toUpperCase().trim().replace(" ", "_").replace("&", "AND") : "CYBER_RISK";
        Map<String, Object> attrs = (riskAttributes != null) ? riskAttributes : Collections.emptyMap();

        List<FactorScoreItem> factorItems = new ArrayList<>();
        int compositeScore = 0;

        switch (normLob) {
            case "CYBER_RISK" -> {
                // MFA
                boolean hasMfa = getBoolean(attrs, "hasMfa", "mfaEnforced", "mfa");
                int mfaScore = hasMfa ? 20 : 0;
                factorItems.add(new FactorScoreItem("Cyber Controls", "MFA Enforcement", mfaScore, 20,
                    hasMfa ? "Multi-factor authentication enforced across all systems" : "No MFA enforcement detected (High exposure)"));

                // EDR
                boolean hasEdr = getBoolean(attrs, "hasEdr", "edrDeployed", "edr");
                int edrScore = hasEdr ? 15 : 0;
                factorItems.add(new FactorScoreItem("Cyber Controls", "Endpoint Detection & Response (EDR)", edrScore, 15,
                    hasEdr ? "Enterprise EDR actively monitoring endpoints" : "Legacy or no endpoint detection in place"));

                // Backups
                boolean hasBackups = getBoolean(attrs, "hasImmutableBackups", "immutableBackups", "backups");
                int backupScore = hasBackups ? 15 : 0;
                factorItems.add(new FactorScoreItem("Cyber Controls", "Automated Immutable Backups", backupScore, 15,
                    hasBackups ? "Daily air-gapped immutable backup strategy active" : "Backups lack immutability or air-gapping"));

                // Prior Loss History
                int priorLossCount = getInt(attrs, "priorLossCount", "priorClaims", "claimsCount", 0);
                int lossScore;
                String lossNote;
                if (priorLossCount == 0) {
                    lossScore = 30;
                    lossNote = "Clean 3-year claims history with 0 reported loss events";
                } else if (priorLossCount == 1) {
                    lossScore = 15;
                    lossNote = "Single isolated historical claim under mitigation";
                } else {
                    lossScore = 0;
                    lossNote = priorLossCount + " reported loss events in prior 36 months";
                }
                factorItems.add(new FactorScoreItem("Claims Experience", "3-Year Prior Loss History", lossScore, 30, lossNote));

                // Security Awareness Training
                boolean hasTraining = getBoolean(attrs, "hasSecurityTraining", "securityTraining", "training");
                int trainingScore = hasTraining ? 20 : 0;
                factorItems.add(new FactorScoreItem("Cyber Controls", "Security Awareness Training", trainingScore, 20,
                    hasTraining ? "Mandatory quarterly employee phishing simulation & training" : "No regular security training curriculum"));
            }

            case "DIRECTORS_AND_OFFICERS" -> {
                boolean strongFinancials = getBoolean(attrs, "strongFinancials", "auditedFinancials", "financialStrength");
                int finScore = strongFinancials ? 30 : 10;
                factorItems.add(new FactorScoreItem("Financial Assessment", "Balance Sheet & Financial Strength", finScore, 30,
                    strongFinancials ? "Strong liquidity ratio and positive operational cash flows" : "Moderate or unverified financial liquidity"));

                int claims = getInt(attrs, "priorLossCount", "securitiesClaims", 0);
                int claimScore = (claims == 0) ? 30 : (claims == 1 ? 15 : 0);
                factorItems.add(new FactorScoreItem("Claims Experience", "Prior Securities & Regulatory Claims", claimScore, 30,
                    claims == 0 ? "Zero regulatory or shareholder actions reported" : claims + " prior claims recorded"));

                boolean independentBoard = getBoolean(attrs, "independentBoard", "boardGovernance", "governance");
                int govScore = independentBoard ? 20 : 5;
                factorItems.add(new FactorScoreItem("Governance", "Independent Board Oversight", govScore, 20,
                    independentBoard ? "Majority independent board members and audit committee" : "Limited independent governance structure"));

                boolean stableMarketCap = getBoolean(attrs, "stableMarketCap", "marketCapitalization", "stableRevenue");
                int mktCapScore = stableMarketCap ? 20 : 10;
                factorItems.add(new FactorScoreItem("Market Stability", "Market Capitalization & Revenue Stability", mktCapScore, 20,
                    stableMarketCap ? "Established enterprise valuation with low stock volatility" : "Volatile revenue/market valuation tier"));
            }

            case "ERRORS_AND_OMISSIONS" -> {
                boolean peerReview = getBoolean(attrs, "peerReview", "qualityControls", "isoCertified");
                int qcScore = peerReview ? 30 : 10;
                factorItems.add(new FactorScoreItem("Operational Controls", "Quality Assurance & Peer Review", qcScore, 30,
                    peerReview ? "Formal peer review & QA sign-off protocols enforced" : "Ad-hoc quality assurance workflows"));

                int lossRatio = getInt(attrs, "priorLossRatio", "lossRatio", 35);
                int lrScore = (lossRatio < 30) ? 30 : (lossRatio <= 60 ? 15 : 0);
                factorItems.add(new FactorScoreItem("Loss Performance", "Historical Loss Ratio", lrScore, 30,
                    "Historical 5-year loss ratio measured at " + lossRatio + "%"));

                boolean standardContracts = getBoolean(attrs, "standardContracts", "contractReviewProcess", "legalReview");
                int crScore = standardContracts ? 20 : 5;
                factorItems.add(new FactorScoreItem("Legal Risk", "Contract Review & Limitation of Liability", crScore, 20,
                    standardContracts ? "Mandatory legal review with liability limitation clauses" : "Non-standard contractual indemnities permitted"));

                boolean expStaff = getBoolean(attrs, "experiencedStaff", "employeeExperience", "seniorStaffRatio");
                int expScore = expStaff ? 20 : 10;
                factorItems.add(new FactorScoreItem("Human Capital", "Professional Staff Experience", expScore, 20,
                    expStaff ? "Average professional tenure exceeds 7 years" : "High proportion of entry-level practitioners"));
            }

            case "EMPLOYMENT_PRACTICES_LIABILITY" -> {
                boolean hrHandbooks = getBoolean(attrs, "hrHandbooks", "hrPoliciesAndHandbooks", "hrManual");
                int hrScore = hrHandbooks ? 25 : 5;
                factorItems.add(new FactorScoreItem("HR Infrastructure", "HR Policies & Employee Handbooks", hrScore, 25,
                    hrHandbooks ? "Comprehensive up-to-date employee handbook with legal review" : "Outdated or informal employee policies"));

                boolean termProtocols = getBoolean(attrs, "severanceProtocols", "severanceAndTerminationProtocols", "legalSignoff");
                int termScore = termProtocols ? 25 : 5;
                factorItems.add(new FactorScoreItem("HR Infrastructure", "Termination & Severance Protocols", termScore, 25,
                    termProtocols ? "Two-level managerial & legal sign-off required for terminations" : "Single-manager discretionary termination process"));

                int epliClaims = getInt(attrs, "pastEpliClaims", "priorLossCount", 0);
                int claimScore = (epliClaims == 0) ? 30 : (epliClaims == 1 ? 15 : 0);
                factorItems.add(new FactorScoreItem("Claims Experience", "Prior EPLI Claims History", claimScore, 30,
                    epliClaims == 0 ? "Zero discrimination or wrongful termination claims in 5 years" : epliClaims + " prior claims recorded"));

                boolean annualTraining = getBoolean(attrs, "annualTraining", "harassmentTraining", "complianceTraining");
                int trainScore = annualTraining ? 20 : 0;
                factorItems.add(new FactorScoreItem("Compliance", "Annual Anti-Harassment & Diversity Training", trainScore, 20,
                    annualTraining ? "100% staff completion of annual anti-harassment training" : "Training not mandatory across all staff tiers"));
            }

            default -> { // MEDICAL_PROFESSIONAL_LIABILITY and others
                boolean credentialing = getBoolean(attrs, "credentialingProcess", "formalCredentialing", "credentialing");
                int credScore = credentialing ? 30 : 10;
                factorItems.add(new FactorScoreItem("Clinical Governance", "Physician Credentialing & Privileging", credScore, 30,
                    credentialing ? "Formal bi-annual board-approved peer review credentialing" : "Informal or single-source physician verification"));

                boolean incidentReporting = getBoolean(attrs, "incidentReportingSystem", "incidentSystem", "adverseEventSystem");
                int incScore = incidentReporting ? 25 : 5;
                factorItems.add(new FactorScoreItem("Risk Management", "Adverse Incident Reporting System", incScore, 25,
                    incidentReporting ? "Near-miss electronic incident reporting with root-cause analysis" : "Paper-based incident escalation"));

                int medLosses = getInt(attrs, "lossHistory", "priorLossCount", 0);
                int medLossScore = (medLosses == 0) ? 30 : (medLosses == 1 ? 15 : 0);
                factorItems.add(new FactorScoreItem("Claims Experience", "Prior Malpractice Claims", medLossScore, 30,
                    medLosses == 0 ? "Zero malpractice loss events in 5-year operating window" : medLosses + " prior malpractice claims logged"));

                boolean accredited = getBoolean(attrs, "accreditationStatus", "jointCommissionAccredited", "accredited");
                int accScore = accredited ? 15 : 5;
                factorItems.add(new FactorScoreItem("Institutional Quality", "Accreditation Status (Joint Commission)", accScore, 15,
                    accredited ? "Full gold seal accreditation with zero major non-conformances" : "Regional or provisional accreditation tier"));
            }
        }

        for (FactorScoreItem item : factorItems) {
            compositeScore += item.scoreAwarded();
        }

        compositeScore = Math.max(0, Math.min(100, compositeScore));
        String riskTier = determineRiskTier(compositeScore);

        return new RiskScoreResponse(
            submissionId,
            compositeScore,
            riskTier,
            factorItems,
            Instant.now()
        );
    }

    public String determineRiskTier(int score) {
        if (score >= 80) return "LOW";
        if (score >= 60) return "MEDIUM";
        if (score >= 40) return "HIGH";
        return "ELEVATED";
    }

    private boolean getBoolean(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k)) {
                Object val = map.get(k);
                if (val instanceof Boolean b) return b;
                if (val instanceof String s) return Boolean.parseBoolean(s) || "1".equals(s) || "yes".equalsIgnoreCase(s);
                if (val instanceof Number n) return n.intValue() > 0;
            }
        }
        return false;
    }

    private int getInt(Map<String, Object> map, String key1, String key2, int defaultVal) {
        if (map.containsKey(key1)) {
            Object v = map.get(key1);
            if (v instanceof Number n) return n.intValue();
            if (v instanceof String s) {
                try { return Integer.parseInt(s.replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
            }
        }
        if (map.containsKey(key2)) {
            Object v = map.get(key2);
            if (v instanceof Number n) return n.intValue();
            if (v instanceof String s) {
                try { return Integer.parseInt(s.replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
            }
        }
        return defaultVal;
    }

    private int getInt(Map<String, Object> map, String key1, String key2, String key3, int defaultVal) {
        int v = getInt(map, key1, key2, -999);
        if (v != -999) return v;
        if (map.containsKey(key3)) {
            Object val = map.get(key3);
            if (val instanceof Number n) return n.intValue();
            if (val instanceof String s) {
                try { return Integer.parseInt(s.replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
            }
        }
        return defaultVal;
    }
}
