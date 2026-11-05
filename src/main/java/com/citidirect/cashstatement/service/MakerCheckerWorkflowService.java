package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.DeliveryOptionDTO;
import com.citidirect.cashstatement.entity.DeliveryOption;
import com.citidirect.cashstatement.repository.DeliveryOptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MakerCheckerWorkflowService {

    private final DeliveryOptionRepository deliveryOptionRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public MakerCheckerWorkflowService(DeliveryOptionRepository deliveryOptionRepository,
                                       AuditLogService auditLogService,
                                       ObjectMapper objectMapper) {
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<DeliveryOptionDTO> getAllDeliveryOptions() {
        return deliveryOptionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryOptionDTO> getPendingDeliveryOptions() {
        return deliveryOptionRepository.findByStatus("PENDING_APPROVAL").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliveryOptionDTO getDeliveryOptionById(String id) {
        DeliveryOption option = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery option not found with ID: " + id));
        return mapToDTO(option);
    }

    @Transactional
    public DeliveryOptionDTO createDeliveryOption(DeliveryOptionDTO dto, String currentUserId, String currentUserName) {
        DeliveryOption option = new DeliveryOption();
        option.setId(dto.getId() != null ? dto.getId() : "del-" + UUID.randomUUID().toString().substring(0, 8));
        option.setScheduleId(dto.getScheduleId());
        option.setDeliveryChannel(dto.getDeliveryChannel() != null ? dto.getDeliveryChannel() : "SFTP");

        try {
            if (dto.getDestinationConfig() != null) {
                option.setDestinationConfigJson(objectMapper.writeValueAsString(dto.getDestinationConfig()));
            } else {
                option.setDestinationConfigJson("{}");
            }
        } catch (Exception e) {
            option.setDestinationConfigJson("{}");
        }

        option.setStatus("PENDING_APPROVAL");
        option.setMakerId(currentUserId != null ? currentUserId : (dto.getMakerId() != null ? dto.getMakerId() : "usr_maker_01"));
        option.setMakerName(currentUserName != null ? currentUserName : (dto.getMakerName() != null ? dto.getMakerName() : "M. Sterling (Senior Treasury Analyst)"));
        option.setCreatedAt(LocalDateTime.now());
        option.setUpdatedAt(LocalDateTime.now());

        DeliveryOption saved = deliveryOptionRepository.save(option);
        auditLogService.log(saved.getMakerId(), "CREATE_DELIVERY_OPTION", "DELIVERY_OPTION", saved.getId(), null, null, "Created delivery option for schedule: " + saved.getScheduleId());

        return mapToDTO(saved);
    }

    @Transactional
    public DeliveryOptionDTO authorizeDeliveryOption(String id, String comments, String currentCheckerId, String currentCheckerName) {
        DeliveryOption option = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery option not found with ID: " + id));

        String checkerId = currentCheckerId != null ? currentCheckerId : "usr_checker_01";
        String checkerName = currentCheckerName != null ? currentCheckerName : "J. Vance (Tier 4 Authorizer)";

        // Enforce Segregation of Duties (Maker cannot be Checker)
        if (option.getMakerId() != null && option.getMakerId().equalsIgnoreCase(checkerId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Dual-control violation: Maker cannot authorize their own submission (maker_id: " + option.getMakerId() + ", checker_id: " + checkerId + ")"
            );
        }

        option.setStatus("AUTHORIZED");
        option.setCheckerId(checkerId);
        option.setCheckerName(checkerName);
        option.setCheckerComments(comments);
        option.setAuthorizedAt(LocalDateTime.now());
        option.setUpdatedAt(LocalDateTime.now());

        DeliveryOption saved = deliveryOptionRepository.save(option);
        auditLogService.log(checkerId, "AUTHORIZE_DELIVERY_OPTION", "DELIVERY_OPTION", saved.getId(), null, null, "Authorized with comments: " + comments);

        return mapToDTO(saved);
    }

    @Transactional
    public DeliveryOptionDTO rejectDeliveryOption(String id, String comments, String currentCheckerId, String currentCheckerName) {
        DeliveryOption option = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery option not found with ID: " + id));

        String checkerId = currentCheckerId != null ? currentCheckerId : "usr_checker_01";
        String checkerName = currentCheckerName != null ? currentCheckerName : "J. Vance (Tier 4 Authorizer)";

        option.setStatus("REJECTED");
        option.setCheckerId(checkerId);
        option.setCheckerName(checkerName);
        option.setCheckerComments(comments);
        option.setUpdatedAt(LocalDateTime.now());

        DeliveryOption saved = deliveryOptionRepository.save(option);
        auditLogService.log(checkerId, "REJECT_DELIVERY_OPTION", "DELIVERY_OPTION", saved.getId(), null, null, "Rejected with comments: " + comments);

        return mapToDTO(saved);
    }

    private DeliveryOptionDTO mapToDTO(DeliveryOption option) {
        DeliveryOptionDTO dto = new DeliveryOptionDTO();
        dto.setId(option.getId());
        dto.setScheduleId(option.getScheduleId());
        dto.setDeliveryChannel(option.getDeliveryChannel());
        dto.setStatus(option.getStatus());
        dto.setMakerId(option.getMakerId());
        dto.setMakerName(option.getMakerName());
        dto.setCheckerId(option.getCheckerId());
        dto.setCheckerName(option.getCheckerName());
        dto.setCheckerComments(option.getCheckerComments());

        if (option.getAuthorizedAt() != null) {
            dto.setAuthorizedAt(option.getAuthorizedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (option.getCreatedAt() != null) {
            dto.setCreatedAt(option.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        try {
            if (option.getDestinationConfigJson() != null && !option.getDestinationConfigJson().isEmpty()) {
                Map<String, Object> map = objectMapper.readValue(option.getDestinationConfigJson(), Map.class);
                dto.setDestinationConfig(map);
            }
        } catch (Exception e) {
            // fallback
        }

        return dto;
    }
}
