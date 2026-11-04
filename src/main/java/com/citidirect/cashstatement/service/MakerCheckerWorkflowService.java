package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.AuthorizeRequestDTO;
import com.citidirect.cashstatement.dto.DeliveryOptionDTO;
import com.citidirect.cashstatement.entity.DeliveryOption;
import com.citidirect.cashstatement.repository.DeliveryOptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class MakerCheckerWorkflowService {

    private final DeliveryOptionRepository deliveryOptionRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MakerCheckerWorkflowService(DeliveryOptionRepository deliveryOptionRepository,
                                       AuditLogService auditLogService) {
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public DeliveryOption createDeliveryOption(DeliveryOptionDTO dto, String makerId, String clientIp) {
        DeliveryOption opt = new DeliveryOption();
        opt.setScheduleId(dto.getScheduleId());
        opt.setDeliveryChannel(dto.getDeliveryChannel() != null ? dto.getDeliveryChannel() : "DOWNLOAD");
        try {
            opt.setDestinationConfig(dto.getDestinationConfig() != null ? objectMapper.writeValueAsString(dto.getDestinationConfig()) : "{}");
        } catch (Exception e) {
            opt.setDestinationConfig("{}");
        }
        opt.setStatus("PENDING_APPROVAL");
        opt.setMakerId(makerId);

        DeliveryOption saved = deliveryOptionRepository.save(opt);
        auditLogService.logAction(makerId, "CREATE_DELIVERY_OPTION", "DeliveryOption", saved.getId(), clientIp, "Created delivery channel: " + opt.getDeliveryChannel());
        return saved;
    }

    @Transactional
    public DeliveryOption authorizeDeliveryOption(String id, AuthorizeRequestDTO request, String checkerId, String clientIp) {
        DeliveryOption opt = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery option not found with ID: " + id));

        // Strict Maker-Checker Segregation of Duties (SoD) enforcement
        if (opt.getMakerId() != null && opt.getMakerId().equalsIgnoreCase(checkerId)) {
            throw new IllegalStateException("Dual-control violation: Maker cannot authorize their own submission (maker_id: " + opt.getMakerId() + ", checker_id: " + checkerId + ").");
        }

        opt.setStatus("AUTHORIZED");
        opt.setCheckerId(checkerId);
        opt.setCheckerComments(request != null ? request.getComments() : "Approved");
        opt.setAuthorizedAt(Instant.now());
        opt.setUpdatedAt(Instant.now());

        DeliveryOption updated = deliveryOptionRepository.save(opt);
        auditLogService.logAction(checkerId, "AUTHORIZE", "DeliveryOption", updated.getId(), clientIp, "Authorized delivery option. Comments: " + opt.getCheckerComments());
        return updated;
    }

    @Transactional
    public DeliveryOption rejectDeliveryOption(String id, AuthorizeRequestDTO request, String checkerId, String clientIp) {
        DeliveryOption opt = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery option not found with ID: " + id));

        opt.setStatus("REJECTED");
        opt.setCheckerId(checkerId);
        opt.setCheckerComments(request != null ? request.getComments() : "Rejected by checker");
        opt.setUpdatedAt(Instant.now());

        DeliveryOption updated = deliveryOptionRepository.save(opt);
        auditLogService.logAction(checkerId, "REJECT", "DeliveryOption", updated.getId(), clientIp, "Rejected delivery option. Comments: " + opt.getCheckerComments());
        return updated;
    }

    @Transactional(readOnly = true)
    public List<DeliveryOption> getPendingDeliveryOptions() {
        return deliveryOptionRepository.findByStatus("PENDING_APPROVAL");
    }

    @Transactional(readOnly = true)
    public List<DeliveryOption> getAllDeliveryOptions() {
        return deliveryOptionRepository.findAll();
    }
}
