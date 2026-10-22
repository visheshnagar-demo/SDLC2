package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.RiskScoreResponse;
import com.reinsurance.portal.entity.RiskFactorBreakdownEntity;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.RiskFactorBreakdownRepository;
import com.reinsurance.portal.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RiskScoringEngine {

    private final SubmissionRepository submissionRepository;
    private final RiskFactorBreakdownRepository factorBreakdownRepository;

    public RiskScoringEngine(SubmissionRepository submissionRepository,
                             RiskFactorBreakdownRepository factorBreakdownRepository) {
        this.submissionRepository = submissionRepository;
        this.factorBreakdownRepository = factorBreakdownRepository;
    }

    @Transactional
    public RiskScoreResponse scoreSubmission(SubmissionEntity submission, Map<String, Object> riskAttributes) {
        List<RiskScoreResponse.FactorScoreItem> factorItems = new ArrayList<>();
        String lob = submission.getLineOfBusiness();

        int compositeScore = 0;

        if ("Cyber Risk".equalsIgnoreCase(lob)) {
            // Cyber Risk Scoring
            boolean mfa = getBoolean(riskAttributes, "hasMfa", true);
            boolean edr = getBoolean(riskAttributes, "hasEdr", true);
            boolean backups = getBoolean(riskAttributes, "hasBackups", true);
            int priorLosses = getInt(riskAttributes, "priorLossCount", 0);
            boolean training = getBoolean(riskAttributes, "hasTraining", true);

            int mfaPts = mfa ? 20 : 0;
            int edrPts = edr ? 15 : 0;
            int backupPts = backups ? 15 : 0;
            int lossPts = priorLosses == 0 ? 30 : (priorLosses <= 2 ? 15 : 0);
            int trainingPts = training ? 20 : 0;

            factorItems.add(new RiskScoreResponse.FactorScoreItem("Technical Controls", "MFA Enforcement", mfaPts, 20, mfa ? "MFA active across enterprise" : "MFA not fully enforced"));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Technical Controls", "EDR Deployment", edrPts, 15, edr ? "Endpoint Detection & Response active" : "Missing central EDR"));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Operational Resilience", "Immutable Backups", backupPts, 15, backups ? "Air-gapped / immutable backups present" : "Backup controls insufficient"));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Loss History", "3-Year Prior Claims", lossPts, 30, "Prior claims count: " + priorLosses));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Human Factors", "Security Awareness Training", trainingPts, 20, training ? "Quarterly phishing tests passed" : "No structured awareness program"));

            compositeScore = mfaPts + edrPts + backupPts + lossPts + trainingPts;

        } else if ("D&O".equalsIgnoreCase(lob)) {
            // D&O Scoring
            String financialHealth = getString(riskAttributes, "financialStrength", "Strong");
            int claimsCount = getInt(riskAttributes, "priorClaimsCount", 0);
            boolean governance = getBoolean(riskAttributes, "independentBoard", true);
            boolean regulatoryHistory = getBoolean(riskAttributes, "regulatoryInquiries", false);

            int finPts = "Strong".equalsIgnoreCase(financialHealth) ? 30 : ("Moderate".equalsIgnoreCase(financialHealth) ? 15 : 5);
            int claimsPts = claimsCount == 0 ? 35 : (claimsCount <= 1 ? 20 : 0);
            int govPts = governance ? 20 : 10;
            int regPts = !regulatoryHistory ? 15 : 0;

            factorItems.add(new RiskScoreResponse.FactorScoreItem("Financial Strength", "Balance Sheet Liquidity & D/E", finPts, 30, "Financial health assessed as " + financialHealth));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Claims Record", "Historical D&O Securities Litigation", claimsPts, 35, "Prior claims count: " + claimsCount));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Corporate Governance", "Independent Board Majority", govPts, 20, governance ? "Majority independent board members" : "Inside board control"));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Compliance", "Clean Regulatory Record", regPts, 15, !regulatoryHistory ? "No active regulatory inquiries" : "Prior regulatory inquiries noted"));

            compositeScore = finPts + claimsPts + govPts + regPts;

        } else {
            // General specialty scoring (E&O, EPLI, MPL)
            int priorLossCount = getInt(riskAttributes, "priorLossCount", 0);
            int experienceYears = getInt(riskAttributes, "experienceYears", 10);
            boolean riskControls = getBoolean(riskAttributes, "standardRiskControls", true);

            int lossPts = priorLossCount == 0 ? 40 : (priorLossCount <= 2 ? 20 : 5);
            int expPts = experienceYears >= 10 ? 30 : (experienceYears >= 5 ? 20 : 10);
            int ctrlPts = riskControls ? 30 : 10;

            factorItems.add(new RiskScoreResponse.FactorScoreItem("Loss Experience", "Historical Loss Ratio & Claims", lossPts, 40, "Claims record: " + priorLossCount));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Underwriting Experience", "Industry Tenure & Maturity", expPts, 30, "Operating tenure: " + experienceYears + " years"));
            factorItems.add(new RiskScoreResponse.FactorScoreItem("Operating Procedures", "Standard Risk Protocols", ctrlPts, 30, riskControls ? "Documented risk mitigation protocols" : "Informal risk management"));

            compositeScore = lossPts + expPts + ctrlPts;
        }

        // Tier classification
        String tier;
        if (compositeScore >= 75) {
            tier = "LOW";
        } else if (compositeScore >= 50) {
            tier = "MEDIUM";
        } else {
            tier = "HIGH";
        }

        // Persist score to submission entity
        submission.setRiskScore(compositeScore);
        submission.setRiskTier(tier);
        submissionRepository.save(submission);

        // Save factors
        factorBreakdownRepository.deleteBySubmissionId(submission.getId());
        for (RiskScoreResponse.FactorScoreItem item : factorItems) {
            RiskFactorBreakdownEntity entity = new RiskFactorBreakdownEntity();
            entity.setSubmission(submission);
            entity.setFactorCategory(item.factorCategory());
            entity.setFactorName(item.factorName());
            entity.setScoreAwarded(item.pointsEarned());
            entity.setMaxScore(item.maxPoints());
            entity.setEvaluationNotes(item.evaluationNotes());
            factorBreakdownRepository.save(entity);
        }

        return new RiskScoreResponse(submission.getId(), compositeScore, tier, factorItems, Instant.now());
    }

    private boolean getBoolean(Map<String, Object> map, String key, boolean defaultVal) {
        if (map == null || !map.containsKey(key)) return defaultVal;
        Object val = map.get(key);
        if (val instanceof Boolean b) return b;
        return Boolean.parseBoolean(String.valueOf(val));
    }

    private int getInt(Map<String, Object> map, String key, int defaultVal) {
        if (map == null || !map.containsKey(key)) return defaultVal;
        Object val = map.get(key);
        if (val instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(val));
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private String getString(Map<String, Object> map, String key, String defaultVal) {
        if (map == null || !map.containsKey(key)) return defaultVal;
        return String.valueOf(map.get(key));
    }
}
