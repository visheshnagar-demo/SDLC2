package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.AuthorizationRequest;
import com.citidirect.cashstatement.dto.DeliveryOptionRequest;
import com.citidirect.cashstatement.dto.DeliveryOptionResponse;
import com.citidirect.cashstatement.entity.DeliveryOption;
import com.citidirect.cashstatement.entity.ReportSchedule;
import com.citidirect.cashstatement.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.repository.ReportScheduleRepository;
import com.citidirect.cashstatement.security.DualControlInterceptor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryOptionsService {

    private final DeliveryOptionRepository deliveryOptionRepository;
    private final ReportScheduleRepository scheduleRepository;
    private final DualControlInterceptor dualControlInterceptor;
    private final AuditLogService auditLogService;

    public DeliveryOptionsService(DeliveryOptionRepository deliveryOptionRepository,
                                  ReportScheduleRepository scheduleRepository,
                                  DualControlInterceptor dualControlInterceptor,
                                  AuditLogService auditLogService) {
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.scheduleRepository = scheduleRepository;
        this.dualControlInterceptor = dualControlInterceptor;
        this.auditLogService = auditLogService;
    }

    public List<DeliveryOptionResponse> getAllDeliveryOptions() {
        return deliveryOptionRepository.findAll().stream()
                .map(DeliveryOptionResponse::new)
                .collect(Collectors.toList());
    }

    public List<DeliveryOptionResponse> getPendingDeliveryOptions() {
        return deliveryOptionRepository.findByStatus("PENDING_AUTHORIZATION").stream()
                .map(DeliveryOptionResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryOptionResponse createDeliveryOption(DeliveryOptionRequest request, String makerId) {
        if (request == null || request.getChannelType() == null || request.getDestinationTarget() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "channel_type and destination_target are required");
        }

        DeliveryOption option = new DeliveryOption();
        option.setChannelType(request.getChannelType());
        option.setDestinationTarget(request.getDestinationTarget());
        option.setSftpFolderPath(request.getSftpFolderPath());
        option.setEncryptionProtocol(request.getEncryptionProtocol());
        option.setSshKeyMethod(request.getSshKeyMethod());
        option.setStatus("PENDING_AUTHORIZATION");
        option.setMakerId(makerId != null ? makerId : "user-maker-01");
        option.setCreatedAt(Instant.now());
        option.setUpdatedAt(Instant.now());

        DeliveryOption saved = deliveryOptionRepository.save(option);

        auditLogService.logAction(
            option.getMakerId(),
            "Maker User",
            "ROLE_MAKER",
            "CREATE",
            "DeliveryOption",
            saved.getId(),
            "127.0.0.1",
            "Created delivery option for channel " + saved.getChannelType()
        );

        return new DeliveryOptionResponse(saved);
    }

    @Transactional
    public Object authorizeEntity(String id, AuthorizationRequest request, String checkerId) {
        String effectiveChecker = checkerId != null ? checkerId : "user-checker-01";

        // Try delivery option first
        DeliveryOption option = deliveryOptionRepository.findById(id).orElse(null);
        if (option != null) {
            dualControlInterceptor.validateDualControl(option.getMakerId(), effectiveChecker);
            if (!"PENDING_AUTHORIZATION".equalsIgnoreCase(option.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending records can be authorized.");
            }
            option.setStatus("AUTHORIZED");
            option.setCheckerId(effectiveChecker);
            option.setCheckerComments(request != null ? request.getCheckerComments() : "Authorized by checker");
            option.setUpdatedAt(Instant.now());
            DeliveryOption saved = deliveryOptionRepository.save(option);

            auditLogService.logAction(
                effectiveChecker,
                "Checker User",
                "ROLE_CHECKER",
                "AUTHORIZE",
                "DeliveryOption",
                saved.getId(),
                "127.0.0.1",
                "Authorized delivery option " + saved.getId()
            );

            return new DeliveryOptionResponse(saved);
        }

        // Try schedule if not found as delivery option
        ReportSchedule schedule = scheduleRepository.findById(id).orElse(null);
        if (schedule != null) {
            dualControlInterceptor.validateDualControl(schedule.getMakerId(), effectiveChecker);
            if (!"PENDING_AUTHORIZATION".equalsIgnoreCase(schedule.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending records can be authorized.");
            }
            schedule.setStatus("AUTHORIZED");
            schedule.setCheckerId(effectiveChecker);
            schedule.setCheckerComments(request != null ? request.getCheckerComments() : "Authorized by checker");
            schedule.setUpdatedAt(Instant.now());
            ReportSchedule saved = scheduleRepository.save(schedule);

            auditLogService.logAction(
                effectiveChecker,
                "Checker User",
                "ROLE_CHECKER",
                "AUTHORIZE",
                "ReportSchedule",
                saved.getId(),
                "127.0.0.1",
                "Authorized report schedule " + saved.getId()
            );

            return saved;
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity not found with ID: " + id);
    }

    @Transactional
    public Object rejectEntity(String id, AuthorizationRequest request, String checkerId) {
        String effectiveChecker = checkerId != null ? checkerId : "user-checker-01";

        if (request == null || request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is mandatory.");
        }

        // Try delivery option first
        DeliveryOption option = deliveryOptionRepository.findById(id).orElse(null);
        if (option != null) {
            dualControlInterceptor.validateDualControl(option.getMakerId(), effectiveChecker);
            if (!"PENDING_AUTHORIZATION".equalsIgnoreCase(option.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending records can be rejected.");
            }
            option.setStatus("REJECTED");
            option.setCheckerId(effectiveChecker);
            option.setRejectionReason(request.getRejectionReason());
            option.setUpdatedAt(Instant.now());
            DeliveryOption saved = deliveryOptionRepository.save(option);

            auditLogService.logAction(
                effectiveChecker,
                "Checker User",
                "ROLE_CHECKER",
                "REJECT",
                "DeliveryOption",
                saved.getId(),
                "127.0.0.1",
                "Rejected delivery option " + saved.getId() + " - Reason: " + request.getRejectionReason()
            );

            return new DeliveryOptionResponse(saved);
        }

        // Try schedule
        ReportSchedule schedule = scheduleRepository.findById(id).orElse(null);
        if (schedule != null) {
            dualControlInterceptor.validateDualControl(schedule.getMakerId(), effectiveChecker);
            if (!"PENDING_AUTHORIZATION".equalsIgnoreCase(schedule.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending records can be rejected.");
            }
            schedule.setStatus("REJECTED");
            schedule.setCheckerId(effectiveChecker);
            schedule.setRejectionReason(request.getRejectionReason());
            schedule.setUpdatedAt(Instant.now());
            ReportSchedule saved = scheduleRepository.save(schedule);

            auditLogService.logAction(
                effectiveChecker,
                "Checker User",
                "ROLE_CHECKER",
                "REJECT",
                "ReportSchedule",
                saved.getId(),
                "127.0.0.1",
                "Rejected report schedule " + saved.getId() + " - Reason: " + request.getRejectionReason()
            );

            return saved;
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity not found with ID: " + id);
    }
}
