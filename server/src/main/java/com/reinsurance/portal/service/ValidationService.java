package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.CreateSubmissionRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class ValidationService {

    private static final Map<String, List<String>> REQUIRED_DOCS_BY_LOB = new HashMap<>();

    static {
        REQUIRED_DOCS_BY_LOB.put("CYBER_RISK", List.of("APPLICATION", "LOSS_RUNS"));
        REQUIRED_DOCS_BY_LOB.put("DIRECTORS_AND_OFFICERS", List.of("APPLICATION", "FINANCIAL_STATEMENTS"));
        REQUIRED_DOCS_BY_LOB.put("ERRORS_AND_OMISSIONS", List.of("APPLICATION", "LOSS_RUNS"));
        REQUIRED_DOCS_BY_LOB.put("EMPLOYMENT_PRACTICES_LIABILITY", List.of("APPLICATION", "LOSS_RUNS"));
        REQUIRED_DOCS_BY_LOB.put("MEDICAL_PROFESSIONAL_LIABILITY", List.of("APPLICATION", "LOSS_RUNS"));
    }

    public List<String> validateSubmission(CreateSubmissionRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.effectiveDate() == null) {
            errors.add("Effective date is mandatory");
        }
        if (request.expiryDate() == null) {
            errors.add("Expiry date is mandatory");
        }
        if (request.effectiveDate() != null && request.expiryDate() != null) {
            if (!request.effectiveDate().isBefore(request.expiryDate())) {
                errors.add("Effective date must be strictly before expiry date");
            }
        }

        if (request.policyLimit() == null || request.policyLimit().compareTo(BigDecimal.ZERO) <= 0) {
            errors.add("Policy limit must be strictly positive");
        }

        if (request.attachmentPoint() == null || request.attachmentPoint().compareTo(BigDecimal.ZERO) < 0) {
            errors.add("Attachment point cannot be negative");
        }

        if (request.policyLimit() != null && request.attachmentPoint() != null) {
            if (request.policyLimit().compareTo(request.attachmentPoint()) <= 0) {
                errors.add("Policy limit (" + request.policyLimit() + ") must strictly exceed attachment point (" + request.attachmentPoint() + ")");
            }
        }

        if (request.grossPremium() == null || request.grossPremium().compareTo(BigDecimal.ZERO) <= 0) {
            errors.add("Gross premium must be strictly positive");
        }

        if (request.retention() == null || request.retention().compareTo(BigDecimal.ZERO) < 0) {
            errors.add("Retention cannot be negative");
        }

        return errors;
    }

    public List<String> getRequiredDocumentsForLob(String lineOfBusiness) {
        if (lineOfBusiness == null) return List.of("APPLICATION");
        String normLob = lineOfBusiness.toUpperCase().trim().replace(" ", "_").replace("&", "AND");
        return REQUIRED_DOCS_BY_LOB.getOrDefault(normLob, List.of("APPLICATION", "LOSS_RUNS"));
    }

    public List<String> checkDocumentCompleteness(String lineOfBusiness, Collection<String> uploadedDocTypes) {
        List<String> required = getRequiredDocumentsForLob(lineOfBusiness);
        List<String> missing = new ArrayList<>();
        Set<String> uploadedSet = new HashSet<>();
        if (uploadedDocTypes != null) {
            for (String doc : uploadedDocTypes) {
                if (doc != null) uploadedSet.add(doc.toUpperCase().trim());
            }
        }

        for (String req : required) {
            if (!uploadedSet.contains(req)) {
                missing.add(req);
            }
        }
        return missing;
    }
}
