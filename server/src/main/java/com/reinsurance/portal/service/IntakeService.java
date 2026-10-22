package com.reinsurance.portal.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reinsurance.portal.dto.CreateSubmissionRequest;
import com.reinsurance.portal.dto.DocumentUploadResponse;
import com.reinsurance.portal.dto.RiskScoreResponse;
import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.entity.SubmissionDocumentEntity;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.SubmissionDocumentRepository;
import com.reinsurance.portal.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IntakeService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionDocumentRepository documentRepository;
    private final ValidationService validationService;
    private final RiskScoringEngine riskScoringEngine;
    private final AuditTrailService auditTrailService;
    private final ObjectMapper objectMapper;

    public IntakeService(SubmissionRepository submissionRepository,
                         SubmissionDocumentRepository documentRepository,
                         ValidationService validationService,
                         RiskScoringEngine riskScoringEngine,
                         AuditTrailService auditTrailService,
                         ObjectMapper objectMapper) {
        this.submissionRepository = submissionRepository;
        this.documentRepository = documentRepository;
        this.validationService = validationService;
        this.riskScoringEngine = riskScoringEngine;
        this.auditTrailService = auditTrailService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public SubmissionResponse createSubmission(CreateSubmissionRequest request, String userEmail, String userRole) {
        List<String> validationErrors = validationService.validateSubmission(request);
        if (!validationErrors.isEmpty()) {
            throw new IllegalArgumentException("Validation failed: " + String.join("; ", validationErrors));
        }

        SubmissionEntity entity = new SubmissionEntity();
        entity.setCedingCompanyName(request.cedingCompanyName());
        entity.setInsuredName(request.insuredName());
        entity.setLineOfBusiness(request.lineOfBusiness());
        entity.setPolicyLimit(request.policyLimit());
        entity.setAttachmentPoint(request.attachmentPoint());
        entity.setRetention(request.retention());
        entity.setGrossPremium(request.grossPremium());
        entity.setEffectiveDate(request.effectiveDate());
        entity.setExpiryDate(request.expiryDate());
        entity.setIndustry(request.industry());
        entity.setRevenueBand(request.revenueBand());
        entity.setJurisdiction(request.jurisdiction());
        entity.setStatus("RECEIVED");
        entity.setCreatedBy(userEmail != null ? userEmail : "cedant@example.com");

        if (request.riskAttributes() != null) {
            try {
                entity.setRiskAttributesJson(objectMapper.writeValueAsString(request.riskAttributes()));
            } catch (JsonProcessingException e) {
                entity.setRiskAttributesJson("{}");
            }
        }

        SubmissionEntity saved = submissionRepository.save(entity);

        // Score submission automatically
        RiskScoreResponse score = riskScoringEngine.scoreSubmission(saved, request.riskAttributes());

        // Audit Log
        auditTrailService.recordEvent(
                saved,
                "SUBMISSION_CREATED",
                userEmail,
                userRole,
                "New submission created for insured: " + request.insuredName() + " (" + request.lineOfBusiness() + ")",
                null,
                "RECEIVED"
        );

        return mapToResponse(saved, score.factorBreakdown());
    }

    @Transactional
    public DocumentUploadResponse uploadDocument(UUID submissionId, String documentType, MultipartFile file, String userEmail, String userRole) {
        SubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with ID: " + submissionId));

        SubmissionDocumentEntity doc = new SubmissionDocumentEntity();
        doc.setSubmission(submission);
        doc.setDocumentType(documentType != null ? documentType : "APPLICATION");
        doc.setFileName(file.getOriginalFilename());
        doc.setStorageUrl("/storage/documents/" + submissionId + "/" + file.getOriginalFilename());
        doc.setMimeType(file.getContentType());
        doc.setFileSizeBytes(file.getSize());
        doc.setCreatedAt(Instant.now());

        SubmissionDocumentEntity saved = documentRepository.save(doc);

        auditTrailService.recordEvent(
                submission,
                "DOCUMENT_UPLOADED",
                userEmail,
                userRole,
                "Uploaded document " + file.getOriginalFilename() + " (" + documentType + ")",
                null,
                null
        );

        return new DocumentUploadResponse(
                saved.getId(),
                submissionId,
                saved.getDocumentType(),
                saved.getFileName(),
                saved.getStorageUrl(),
                saved.getMimeType(),
                saved.getFileSizeBytes(),
                saved.getCreatedAt()
        );
    }

    public SubmissionResponse mapToResponse(SubmissionEntity entity, List<RiskScoreResponse.FactorScoreItem> factorItems) {
        List<DocumentUploadResponse> docs = documentRepository.findBySubmissionId(entity.getId())
                .stream()
                .map(d -> new DocumentUploadResponse(
                        d.getId(),
                        entity.getId(),
                        d.getDocumentType(),
                        d.getFileName(),
                        d.getStorageUrl(),
                        d.getMimeType(),
                        d.getFileSizeBytes(),
                        d.getCreatedAt()
                ))
                .collect(Collectors.toList());

        long ageHours = Duration.between(entity.getCreatedAt(), Instant.now()).toHours();
        String sla;
        if (ageHours <= 24) {
            sla = "GREEN";
        } else if (ageHours <= 48) {
            sla = "YELLOW";
        } else {
            sla = "RED";
        }

        Map<String, Object> riskAttrs = null;
        if (entity.getRiskAttributesJson() != null) {
            try {
                riskAttrs = objectMapper.readValue(entity.getRiskAttributesJson(), Map.class);
            } catch (Exception ignored) {}
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
                entity.getIsReferred(),
                entity.getAssignedUnderwriterId(),
                entity.getCreatedBy(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                riskAttrs,
                factorItems,
                docs,
                sla,
                ageHours
        );
    }
}
