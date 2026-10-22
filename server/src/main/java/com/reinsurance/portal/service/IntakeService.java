package com.reinsurance.portal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reinsurance.portal.dto.*;
import com.reinsurance.portal.entity.*;
import com.reinsurance.portal.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class IntakeService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionDocumentRepository documentRepository;
    private final RiskFactorBreakdownRepository riskFactorRepository;
    private final UnderwritingAuthorityRepository authorityRepository;
    private final ValidationService validationService;
    private final RiskScoringEngine riskScoringEngine;
    private final AuditTrailService auditTrailService;
    private final ObjectMapper objectMapper;

    @Value("${app.underwriting.default-authority-limit:5000000.00}")
    private BigDecimal defaultAuthorityLimit;

    @Value("${app.underwriting.sla.green-hours:24}")
    private long greenHours;

    @Value("${app.underwriting.sla.yellow-hours:48}")
    private long yellowHours;

    public IntakeService(
            SubmissionRepository submissionRepository,
            SubmissionDocumentRepository documentRepository,
            RiskFactorBreakdownRepository riskFactorRepository,
            UnderwritingAuthorityRepository authorityRepository,
            ValidationService validationService,
            RiskScoringEngine riskScoringEngine,
            AuditTrailService auditTrailService,
            ObjectMapper objectMapper) {
        this.submissionRepository = submissionRepository;
        this.documentRepository = documentRepository;
        this.riskFactorRepository = riskFactorRepository;
        this.authorityRepository = authorityRepository;
        this.validationService = validationService;
        this.riskScoringEngine = riskScoringEngine;
        this.auditTrailService = auditTrailService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public SubmissionResponse createSubmission(CreateSubmissionRequest request, String createdBy, String userRole) {
        List<String> errors = validationService.validateSubmission(request);
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join(", ", errors));
        }

        SubmissionEntity entity = new SubmissionEntity();
        entity.setCedingCompanyName(request.cedingCompanyName().trim());
        entity.setInsuredName(request.insuredName().trim());
        entity.setLineOfBusiness(normalizeLob(request.lineOfBusiness()));
        entity.setPolicyLimit(request.policyLimit());
        entity.setAttachmentPoint(request.attachmentPoint());
        entity.setRetention(request.retention());
        entity.setGrossPremium(request.grossPremium());
        entity.setEffectiveDate(request.effectiveDate());
        entity.setExpiryDate(request.expiryDate());
        entity.setIndustry(request.industry().trim());
        entity.setRevenueBand(request.revenueBand().trim());
        entity.setJurisdiction(request.jurisdiction().trim());
        entity.setStatus("RECEIVED");
        entity.setCreatedBy(createdBy != null ? createdBy : "cedent-user");

        // Convert risk attributes to JSON
        Map<String, Object> attrs = request.riskAttributes() != null ? request.riskAttributes() : Collections.emptyMap();
        try {
            entity.setRiskAttributesJson(objectMapper.writeValueAsString(attrs));
        } catch (Exception e) {
            entity.setRiskAttributesJson("{}");
        }

        // Referral check
        boolean exceedsAuthority = request.policyLimit().compareTo(defaultAuthorityLimit) > 0;
        entity.setReferred(exceedsAuthority);

        SubmissionEntity saved = submissionRepository.save(entity);

        // Run Risk Scoring
        RiskScoreResponse scoreResponse = riskScoringEngine.scoreSubmission(saved.getId(), saved.getLineOfBusiness(), attrs);
        saved.setRiskScore(scoreResponse.compositeScore());
        saved.setRiskTier(scoreResponse.riskTier());

        // Save risk factor breakdowns
        for (RiskScoreResponse.FactorScoreItem factor : scoreResponse.factorBreakdown()) {
            RiskFactorBreakdownEntity factorEntity = new RiskFactorBreakdownEntity(
                saved,
                factor.factorCategory(),
                factor.factorName(),
                factor.scoreAwarded(),
                factor.maxScore(),
                factor.evalNotes()
            );
            riskFactorRepository.save(factorEntity);
        }

        saved = submissionRepository.save(saved);

        // Log audit trail
        String summary = String.format("Submission created for '%s' (%s) with requested limit $%s. Initial Risk Score: %d (%s). Referred: %s",
            saved.getInsuredName(), saved.getLineOfBusiness(), saved.getPolicyLimit().toPlainString(),
            saved.getRiskScore(), saved.getRiskTier(), saved.isReferred());
        auditTrailService.logAction(saved.getId(), "INTAKE", createdBy, userRole, summary);

        return toResponse(saved);
    }

    @Transactional
    public DocumentUploadResponse uploadDocument(UUID submissionId, MultipartFile file, String documentType, String uploadedBy, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new NoSuchElementException("Submission not found with ID: " + submissionId));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload file cannot be empty");
        }

        String origName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String storageUrl = "/storage/submissions/" + submissionId + "/" + origName;

        SubmissionDocumentEntity doc = new SubmissionDocumentEntity();
        doc.setSubmission(submission);
        doc.setDocumentType(documentType != null ? documentType.toUpperCase().trim() : "OTHER");
        doc.setFileName(origName);
        doc.setMimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        doc.setFileSizeBytes(file.getSize());
        doc.setStorageUrl(storageUrl);

        SubmissionDocumentEntity savedDoc = documentRepository.save(doc);

        String summary = String.format("Document uploaded: %s (Type: %s, Size: %d bytes)",
            origName, doc.getDocumentType(), file.getSize());
        auditTrailService.logAction(submissionId, "DOCUMENT_UPLOAD", uploadedBy, userRole, summary);

        return new DocumentUploadResponse(
            savedDoc.getId(),
            submissionId,
            savedDoc.getDocumentType(),
            savedDoc.getFileName(),
            savedDoc.getStorageUrl(),
            savedDoc.getMimeType(),
            savedDoc.getFileSizeBytes(),
            savedDoc.getCreatedAt()
        );
    }

    @Transactional
    public RiskScoreResponse rescoreSubmission(UUID submissionId, String userId, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new NoSuchElementException("Submission not found with ID: " + submissionId));

        Map<String, Object> attrs = parseRiskAttributes(submission.getRiskAttributesJson());
        RiskScoreResponse scoreResponse = riskScoringEngine.scoreSubmission(submission.getId(), submission.getLineOfBusiness(), attrs);

        submission.setRiskScore(scoreResponse.compositeScore());
        submission.setRiskTier(scoreResponse.riskTier());

        // Replace risk factors
        riskFactorRepository.deleteBySubmissionId(submissionId);
        for (RiskScoreResponse.FactorScoreItem factor : scoreResponse.factorBreakdown()) {
            RiskFactorBreakdownEntity factorEntity = new RiskFactorBreakdownEntity(
                submission,
                factor.factorCategory(),
                factor.factorName(),
                factor.scoreAwarded(),
                factor.maxScore(),
                factor.evalNotes()
            );
            riskFactorRepository.save(factorEntity);
        }

        submissionRepository.save(submission);

        auditTrailService.logAction(submissionId, "SCORING", userId, userRole,
            "Risk scoring re-evaluated. New Score: " + scoreResponse.compositeScore() + " (" + scoreResponse.riskTier() + ")");

        return scoreResponse;
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getSubmission(UUID id, String userRole, String cedingCompany) {
        SubmissionEntity submission = submissionRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Submission not found with ID: " + id));

        // RBAC check for Cedent role
        if ("ROLE_CEDANT".equalsIgnoreCase(userRole) && cedingCompany != null && !cedingCompany.isBlank()) {
            if (!submission.getCedingCompanyName().equalsIgnoreCase(cedingCompany.trim())) {
                throw new SecurityException("Access denied: You can only view submissions for your ceding company");
            }
        }

        return toResponse(submission);
    }

    public SubmissionResponse toResponse(SubmissionEntity entity) {
        Map<String, Object> attrs = parseRiskAttributes(entity.getRiskAttributesJson());

        List<DocumentUploadResponse> docResponses = documentRepository.findBySubmissionIdOrderByCreatedAtAsc(entity.getId())
            .stream()
            .map(d -> new DocumentUploadResponse(
                d.getId(), entity.getId(), d.getDocumentType(), d.getFileName(),
                d.getStorageUrl(), d.getMimeType(), d.getFileSizeBytes(), d.getCreatedAt()
            ))
            .toList();

        List<RiskScoreResponse.FactorScoreItem> factorResponses = riskFactorRepository.findBySubmissionIdOrderByCreatedAtAsc(entity.getId())
            .stream()
            .map(f -> new RiskScoreResponse.FactorScoreItem(
                f.getFactorCategory(), f.getFactorName(), f.getScoreAwarded(), f.getMaxScore(), f.getEvalNotes()
            ))
            .toList();

        QuoteResponse quoteResponse = null;
        if (entity.getQuote() != null) {
            QuoteEntity q = entity.getQuote();
            quoteResponse = new QuoteResponse(
                q.getId(), entity.getId(), q.getShareOfferedPercentage(), q.getCedingCommissionPercentage(),
                q.getCalculatedReinsurancePremium(), q.getNetReinsurancePremium(),
                q.getSubjectivities(), q.getConditions(), q.getExclusions(),
                q.getStatus(), q.getCreatedBy(), q.getCreatedAt(), q.getUpdatedAt()
            );
        }

        long elapsedHours = Duration.between(entity.getCreatedAt(), Instant.now()).toHours();
        String slaIndicator;
        if (elapsedHours <= greenHours) {
            slaIndicator = "GREEN";
        } else if (elapsedHours <= yellowHours) {
            slaIndicator = "YELLOW";
        } else {
            slaIndicator = "RED";
        }

        return new SubmissionResponse(
            entity.getId(),
            entity.getCedingCompanyName(),
            entity.getInsuredName(),
            entity.getLineOfBusiness(),
            entity.getPolicyLimit(),
            entity.getAttachmentPoint(),
            entity.getRetention(),
            entity.getGrossPremium(),
            entity.getEffectiveDate(),
            entity.getExpiryDate(),
            entity.getIndustry(),
            entity.getRevenueBand(),
            entity.getJurisdiction(),
            entity.getStatus(),
            entity.getRiskScore(),
            entity.getRiskTier(),
            entity.isReferred(),
            entity.getAssignedUnderwriterId(),
            entity.getCreatedBy(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            attrs,
            docResponses,
            factorResponses,
            quoteResponse,
            elapsedHours,
            slaIndicator
        );
    }

    private String normalizeLob(String lob) {
        if (lob == null) return "CYBER_RISK";
        return lob.toUpperCase().trim().replace(" ", "_").replace("&", "AND");
    }

    private Map<String, Object> parseRiskAttributes(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}
