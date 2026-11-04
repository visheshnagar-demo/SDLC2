package com.citi.cashstatement.service;

import com.citi.cashstatement.entity.MakerCheckerRequest;
import com.citi.cashstatement.entity.ReportSchedule;
import com.citi.cashstatement.repository.MakerCheckerRequestRepository;
import com.citi.cashstatement.repository.ReportScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MakerCheckerService {

    private final MakerCheckerRequestRepository makerCheckerRequestRepository;
    private final ReportScheduleRepository reportScheduleRepository;
    private final AuditLoggerService auditLoggerService;

    public MakerCheckerService(MakerCheckerRequestRepository makerCheckerRequestRepository,
                               ReportScheduleRepository reportScheduleRepository,
                               AuditLoggerService auditLoggerService) {
        this.makerCheckerRequestRepository = makerCheckerRequestRepository;
        this.reportScheduleRepository = reportScheduleRepository;
        this.auditLoggerService = auditLoggerService;
    }

    public MakerCheckerRequest submitRequest(String resourceType, String resourceId, String makerId, String comments) {
        MakerCheckerRequest request = new MakerCheckerRequest();
        request.setId(UUID.randomUUID().toString());
        request.setResourceType(resourceType);
        request.setResourceId(resourceId);
        request.setMakerId(makerId);
        request.setStatus("PENDING");
        request.setMakerComments(comments);
        request.setSubmittedAt(OffsetDateTime.now());

        MakerCheckerRequest saved = makerCheckerRequestRepository.save(request);

        auditLoggerService.logEvent(
                makerId,
                "SUBMIT_MAKER_CHECKER_REQUEST",
                saved.getId(),
                "127.0.0.1",
                "CitiDirect/1.0",
                saved
        );

        return saved;
    }

    public List<MakerCheckerRequest> getPendingRequests() {
        return makerCheckerRequestRepository.findByStatus("PENDING");
    }

    @Transactional
    public MakerCheckerRequest approveRequest(String requestId, String checkerId, String comments) {
        MakerCheckerRequest request = makerCheckerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maker-checker request not found"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not in PENDING status");
        }

        // Segregation of Duties: Maker != Checker
        if (request.getMakerId().equalsIgnoreCase(checkerId)) {
            auditLoggerService.logEvent(
                    checkerId,
                    "SELF_APPROVAL_ATTEMPT_BLOCKED",
                    requestId,
                    "127.0.0.1",
                    "CitiDirect/1.0",
                    "Maker cannot authorize their own submission."
            );
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Maker cannot authorize their own submission.");
        }

        request.setCheckerId(checkerId);
        request.setStatus("APPROVED");
        request.setCheckerComments(comments);
        request.setReviewedAt(OffsetDateTime.now());

        MakerCheckerRequest updated = makerCheckerRequestRepository.save(request);

        // Update target resource status if it is a report schedule
        if ("REPORT_SCHEDULE".equalsIgnoreCase(request.getResourceType()) || "SCHEDULE".equalsIgnoreCase(request.getResourceType())) {
            Optional<ReportSchedule> scheduleOpt = reportScheduleRepository.findById(request.getResourceId());
            scheduleOpt.ifPresent(schedule -> {
                schedule.setStatus("ACTIVE");
                schedule.setUpdatedAt(OffsetDateTime.now());
                reportScheduleRepository.save(schedule);
            });
        }

        auditLoggerService.logEvent(
                checkerId,
                "APPROVE_SCHEDULE",
                requestId,
                "127.0.0.1",
                "CitiDirect/1.0",
                updated
        );

        return updated;
    }

    @Transactional
    public MakerCheckerRequest rejectRequest(String requestId, String checkerId, String comments) {
        MakerCheckerRequest request = makerCheckerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maker-checker request not found"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not in PENDING status");
        }

        request.setCheckerId(checkerId);
        request.setStatus("REJECTED");
        request.setCheckerComments(comments);
        request.setReviewedAt(OffsetDateTime.now());

        MakerCheckerRequest updated = makerCheckerRequestRepository.save(request);

        if ("REPORT_SCHEDULE".equalsIgnoreCase(request.getResourceType()) || "SCHEDULE".equalsIgnoreCase(request.getResourceType())) {
            Optional<ReportSchedule> scheduleOpt = reportScheduleRepository.findById(request.getResourceId());
            scheduleOpt.ifPresent(schedule -> {
                schedule.setStatus("REJECTED");
                schedule.setUpdatedAt(OffsetDateTime.now());
                reportScheduleRepository.save(schedule);
            });
        }

        auditLoggerService.logEvent(
                checkerId,
                "REJECT_SCHEDULE",
                requestId,
                "127.0.0.1",
                "CitiDirect/1.0",
                updated
        );

        return updated;
    }
}
