package com.reinsurance.portal.service;

import com.reinsurance.portal.dto.CreateSubmissionRequest;
import com.reinsurance.portal.entity.SubmissionDocumentEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ValidationService {

    private static final Set<String> ALLOWED_LINES = Set.of(
            "Cyber Risk", "D&O", "E&O", "EPLI", "Medical Professional Liability"
    );

    private static final Map<String, Set<String>> REQUIRED_DOCS_BY_LINE = Map.of(
            "Cyber Risk", Set.of("APPLICATION", "LOSS_RUNS"),
            "D&O", Set.of("APPLICATION", "FINANCIAL_STATEMENTS"),
            "E&O", Set.of("APPLICATION", "LOSS_RUNS"),
            "EPLI", Set.of("APPLICATION", "LOSS_RUNS"),
            "Medical Professional Liability", Set.of("APPLICATION", "LOSS_RUNS", "FINANCIAL_STATEMENTS")
    );

    public List<String> validateSubmission(CreateSubmissionRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.lineOfBusiness() == null || !ALLOWED_LINES.contains(request.lineOfBusiness())) {
            errors.add("Line of business must be one of: " + String.join(", ", ALLOWED_LINES));
        }

        if (request.effectiveDate() != null && request.expiryDate() != null) {
            if (!request.effectiveDate().isBefore(request.expiryDate())) {
                errors.add("Effective date must be strictly before expiry date");
            }
        }

        if (request.policyLimit() != null && request.attachmentPoint() != null) {
            if (request.policyLimit().compareTo(request.attachmentPoint()) <= 0) {
                errors.add("Policy limit must be strictly greater than attachment point");
            }
        }

        return errors;
    }

    public List<String> checkDocumentCompleteness(String lineOfBusiness, List<SubmissionDocumentEntity> uploadedDocs) {
        List<String> missing = new ArrayList<>();
        Set<String> required = REQUIRED_DOCS_BY_LINE.getOrDefault(lineOfBusiness, Set.of("APPLICATION"));

        Set<String> uploadedTypes = uploadedDocs.stream()
                .map(SubmissionDocumentEntity::getDocumentType)
                .collect(java.util.stream.Collectors.toSet());

        for (String reqType : required) {
            if (!uploadedTypes.contains(reqType)) {
                missing.add(reqType);
            }
        }
        return missing;
    }
}
