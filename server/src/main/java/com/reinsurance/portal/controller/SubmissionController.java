package com.reinsurance.portal.controller;

import com.reinsurance.portal.dto.*;
import com.reinsurance.portal.service.AuditTrailService;
import com.reinsurance.portal.service.DecisionWorkflowService;
import com.reinsurance.portal.service.IntakeService;
import com.reinsurance.portal.service.UnderwriterQueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/submissions")
@Tag(name = "Submissions", description = "Endpoints for facultative reinsurance risk intake, queue queries, documents, decisions, and audit trails")
public class SubmissionController {

    private final IntakeService intakeService;
    private final UnderwriterQueueService queueService;
    private final DecisionWorkflowService workflowService;
    private final AuditTrailService auditTrailService;

    public SubmissionController(
            IntakeService intakeService,
            UnderwriterQueueService queueService,
            DecisionWorkflowService workflowService,
            AuditTrailService auditTrailService) {
        this.intakeService = intakeService;
        this.queueService = queueService;
        this.workflowService = workflowService;
        this.auditTrailService = auditTrailService;
    }

    @PostMapping
    @Operation(summary = "Create a new facultative risk submission")
    public ResponseEntity<SubmissionResponse> createSubmission(
            @Valid @RequestBody CreateSubmissionRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "cedent-user") String userId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_CEDANT") String userRole) {
        SubmissionResponse response = intakeService.createSubmission(request, userId, userRole);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Query submissions review queue with filtering, sorting, and pagination")
    public ResponseEntity<Page<SubmissionResponse>> getSubmissionsQueue(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String lineOfBusiness,
            @RequestParam(required = false) String riskTier,
            @RequestParam(required = false) Boolean isReferred,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String slaState,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_UNDERWRITER") String userRole,
            @RequestHeader(value = "X-Ceding-Company", required = false) String cedingCompany) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<SubmissionResponse> result = queueService.queryQueue(
            status, lineOfBusiness, riskTier, isReferred, search, slaState, userRole, cedingCompany, pageable
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full submission details including factor breakdown and documents")
    public ResponseEntity<SubmissionResponse> getSubmission(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_UNDERWRITER") String userRole,
            @RequestHeader(value = "X-Ceding-Company", required = false) String cedingCompany) {
        SubmissionResponse response = intakeService.getSubmission(id, userRole, cedingCompany);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload supporting document for a risk submission")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", defaultValue = "APPLICATION") String documentType,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "user") String userId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_CEDANT") String userRole) {
        DocumentUploadResponse response = intakeService.uploadDocument(id, file, documentType, userId, userRole);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/score")
    @Operation(summary = "Trigger or recalculate risk scoring")
    public ResponseEntity<RiskScoreResponse> rescoreSubmission(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "underwriter") String userId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_UNDERWRITER") String userRole) {
        RiskScoreResponse response = intakeService.rescoreSubmission(id, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Transition submission workflow status")
    public ResponseEntity<SubmissionResponse> transitionStatus(
            @PathVariable UUID id,
            @Valid @RequestBody SubmissionDecisionRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "underwriter") String userId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_UNDERWRITER") String userRole) {
        SubmissionResponse response = workflowService.transitionStatus(id, request, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/referral/decision")
    @Operation(summary = "Approve or reject a manager referral")
    public ResponseEntity<SubmissionResponse> handleReferralDecision(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "manager") String userId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_MANAGER") String userRole) {
        String decision = (String) body.getOrDefault("decision", "APPROVE");
        String notes = (String) body.getOrDefault("managerNotes", "");
        BigDecimal approvedLimit = null;
        if (body.get("approvedLimit") != null) {
            approvedLimit = new BigDecimal(body.get("approvedLimit").toString());
        }

        SubmissionResponse response = workflowService.processReferralDecision(id, decision, notes, approvedLimit, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/audit-trail")
    @Operation(summary = "Retrieve immutable audit trail log for a submission")
    public ResponseEntity<List<AuditLogResponse>> getAuditTrail(@PathVariable UUID id) {
        List<AuditLogResponse> logs = auditTrailService.getLogsForSubmission(id);
        return ResponseEntity.ok(logs);
    }
}
