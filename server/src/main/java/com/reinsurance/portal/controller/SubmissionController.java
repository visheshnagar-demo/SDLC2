package com.reinsurance.portal.controller;

import com.reinsurance.portal.dto.*;
import com.reinsurance.portal.entity.SubmissionEntity;
import com.reinsurance.portal.repository.SubmissionRepository;
import com.reinsurance.portal.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/submissions")
@Tag(name = "Submissions", description = "Risk submission intake, review queue, and decision workflow")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final IntakeService intakeService;
    private final UnderwriterQueueService queueService;
    private final DecisionWorkflowService workflowService;
    private final RiskScoringEngine scoringEngine;
    private final AuditTrailService auditTrailService;
    private final SubmissionRepository submissionRepository;

    public SubmissionController(IntakeService intakeService,
                                UnderwriterQueueService queueService,
                                DecisionWorkflowService workflowService,
                                RiskScoringEngine scoringEngine,
                                AuditTrailService auditTrailService,
                                SubmissionRepository submissionRepository) {
        this.intakeService = intakeService;
        this.queueService = queueService;
        this.workflowService = workflowService;
        this.scoringEngine = scoringEngine;
        this.auditTrailService = auditTrailService;
        this.submissionRepository = submissionRepository;
    }

    @PostMapping
    @Operation(summary = "Create a new facultative risk submission")
    public ResponseEntity<SubmissionResponse> createSubmission(
            @Valid @RequestBody CreateSubmissionRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        String email = userEmail != null ? userEmail : "cedant@example.com";
        String role = userRole != null ? userRole : "ROLE_CEDANT";
        SubmissionResponse response = intakeService.createSubmission(request, email, role);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/documents")
    @Operation(summary = "Upload submission documents")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @PathVariable("id") UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", defaultValue = "APPLICATION") String documentType,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        String email = userEmail != null ? userEmail : "cedant@example.com";
        String role = userRole != null ? userRole : "ROLE_CEDANT";
        DocumentUploadResponse response = intakeService.uploadDocument(id, documentType, file, email, role);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Query submissions queue with filters and pagination")
    public ResponseEntity<Page<SubmissionResponse>> getSubmissions(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "lineOfBusiness", required = false) String lineOfBusiness,
            @RequestParam(value = "riskTier", required = false) String riskTier,
            @RequestParam(value = "cedingCompany", required = false) String cedingCompany,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "DESC") String sortDir,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        Sort sort = "ASC".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<SubmissionResponse> responses = queueService.getSubmissions(
                status, lineOfBusiness, riskTier, cedingCompany, userEmail, userRole, pageRequest
        );
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full submission details and risk factor breakdown")
    public ResponseEntity<SubmissionResponse> getSubmission(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        SubmissionResponse response = queueService.getSubmissionById(id, userEmail, userRole);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/score")
    @Operation(summary = "Trigger or recalculate risk scoring")
    public ResponseEntity<RiskScoreResponse> scoreSubmission(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) Map<String, Object> riskAttributes) {
        SubmissionEntity submission = submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with ID: " + id));
        RiskScoreResponse response = scoringEngine.scoreSubmission(submission, riskAttributes != null ? riskAttributes : Map.of());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Transition submission state (e.g. In Review, Declined, Bound)")
    public ResponseEntity<SubmissionResponse> updateStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody SubmissionDecisionRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        String email = userEmail != null ? userEmail : "underwriter@example.com";
        String role = userRole != null ? userRole : "ROLE_UNDERWRITER";
        SubmissionResponse response = workflowService.updateStatus(id, request, email, role);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/referral/decision")
    @Operation(summary = "Approve or reject manager referral")
    public ResponseEntity<SubmissionResponse> handleReferral(
            @PathVariable("id") UUID id,
            @RequestParam("decision") String decision,
            @RequestParam(value = "managerNotes", required = false) String managerNotes,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        String email = userEmail != null ? userEmail : "admin@example.com";
        String role = userRole != null ? userRole : "ROLE_MANAGER";
        SubmissionResponse response = workflowService.handleManagerReferral(id, decision, managerNotes, email, role);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/audit-trail")
    @Operation(summary = "Retrieve immutable audit history for submission")
    public ResponseEntity<List<AuditLogResponse>> getAuditTrail(@PathVariable("id") UUID id) {
        List<AuditLogResponse> logs = auditTrailService.getAuditTrail(id);
        return ResponseEntity.ok(logs);
    }
}
