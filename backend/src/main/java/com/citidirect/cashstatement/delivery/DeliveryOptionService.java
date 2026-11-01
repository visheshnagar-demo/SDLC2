package com.citidirect.cashstatement.delivery;

import com.citidirect.cashstatement.delivery.dto.AuthorizationRequest;
import com.citidirect.cashstatement.delivery.dto.DeliveryOptionRequest;
import com.citidirect.cashstatement.delivery.dto.DeliveryOptionResponse;
import com.citidirect.cashstatement.delivery.model.DeliveryOption;
import com.citidirect.cashstatement.delivery.repository.DeliveryOptionRepository;
import com.citidirect.cashstatement.masterdata.model.AppUser;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeliveryOptionService {

    private final DeliveryOptionRepository deliveryOptionRepository;
    private final AppUserRepository userRepository;

    public DeliveryOptionService(DeliveryOptionRepository deliveryOptionRepository, AppUserRepository userRepository) {
        this.deliveryOptionRepository = deliveryOptionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public DeliveryOptionResponse createDeliveryOption(DeliveryOptionRequest request, String makerUserId) {
        DeliveryOption option = new DeliveryOption();
        option.setId(UUID.randomUUID().toString());
        option.setName(request.getName());
        option.setDescription(request.getDescription());
        option.setDeliveryType(request.getDeliveryType());
        option.setSecurityMethod(request.getSecurityMethod());
        option.setEmailRecipients(request.getEmailRecipients());
        option.setEmailSubject(request.getEmailSubject());
        option.setEmailMessage(request.getEmailMessage());
        option.setFileName(request.getFileName());
        option.setAuthStatus("PENDING_AUTHORIZATION");
        option.setMakerId(makerUserId);
        option.setCreatedAt(OffsetDateTime.now());
        option.setUpdatedAt(OffsetDateTime.now());

        DeliveryOption saved = deliveryOptionRepository.save(option);
        return mapToResponse(saved);
    }

    @Transactional
    public DeliveryOptionResponse updateDeliveryOption(String id, DeliveryOptionRequest request, String makerUserId) {
        DeliveryOption option = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery option not found: " + id));

        option.setName(request.getName());
        option.setDescription(request.getDescription());
        option.setDeliveryType(request.getDeliveryType());
        option.setSecurityMethod(request.getSecurityMethod());
        option.setEmailRecipients(request.getEmailRecipients());
        option.setEmailSubject(request.getEmailSubject());
        option.setEmailMessage(request.getEmailMessage());
        option.setFileName(request.getFileName());
        option.setAuthStatus("PENDING_AUTHORIZATION"); // Re-enters approval queue
        option.setMakerId(makerUserId);
        option.setCheckerId(null);
        option.setRejectionReason(null);
        option.setUpdatedAt(OffsetDateTime.now());

        DeliveryOption saved = deliveryOptionRepository.save(option);
        return mapToResponse(saved);
    }

    @Transactional
    public DeliveryOptionResponse authorizeDeliveryOption(String id, AuthorizationRequest authRequest, String checkerUserId) {
        DeliveryOption option = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery option not found: " + id));

        // Segregation of Duties (SOD): checker cannot be maker
        if (option.getMakerId().equalsIgnoreCase(checkerUserId)) {
            throw new IllegalStateException("Segregation of duties violation: maker cannot authorize their own delivery option");
        }

        String action = authRequest.getAction().toUpperCase();
        switch (action) {
            case "AUTHORIZE":
                option.setAuthStatus("AUTHORIZED");
                option.setRejectionReason(null);
                break;
            case "REJECT":
                option.setAuthStatus("REJECTED");
                option.setRejectionReason(authRequest.getComment());
                break;
            case "SEND_TO_REPAIR":
                option.setAuthStatus("REPAIR_REQUIRED");
                option.setRejectionReason(authRequest.getComment());
                break;
            default:
                throw new IllegalArgumentException("Invalid authorization action: " + action);
        }

        option.setCheckerId(checkerUserId);
        option.setUpdatedAt(OffsetDateTime.now());
        DeliveryOption saved = deliveryOptionRepository.save(option);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DeliveryOptionResponse> listDeliveryOptions(String tab) {
        List<DeliveryOption> list;
        if ("TO_AUTHORIZE".equalsIgnoreCase(tab)) {
            list = deliveryOptionRepository.findByAuthStatus("PENDING_AUTHORIZATION");
        } else if ("TO_SUBMIT".equalsIgnoreCase(tab)) {
            list = deliveryOptionRepository.findAll().stream()
                    .filter(o -> "REPAIR_REQUIRED".equalsIgnoreCase(o.getAuthStatus()) || "REJECTED".equalsIgnoreCase(o.getAuthStatus()))
                    .collect(Collectors.toList());
        } else {
            list = deliveryOptionRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getTabCounts() {
        long all = deliveryOptionRepository.count();
        long toAuthorize = deliveryOptionRepository.countByAuthStatus("PENDING_AUTHORIZATION");
        long repair = deliveryOptionRepository.countByAuthStatus("REPAIR_REQUIRED");
        long rejected = deliveryOptionRepository.countByAuthStatus("REJECTED");
        return Map.of(
                "all", all,
                "toAuthorize", toAuthorize,
                "toSubmit", repair + rejected
        );
    }

    @Transactional(readOnly = true)
    public DeliveryOptionResponse getDeliveryOption(String id) {
        DeliveryOption option = deliveryOptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery option not found: " + id));
        return mapToResponse(option);
    }

    @Transactional
    public void deleteDeliveryOption(String id) {
        deliveryOptionRepository.deleteById(id);
    }

    public DeliveryOptionResponse mapToResponse(DeliveryOption entity) {
        DeliveryOptionResponse resp = new DeliveryOptionResponse();
        resp.setId(entity.getId());
        resp.setName(entity.getName());
        resp.setDescription(entity.getDescription());
        resp.setDeliveryType(entity.getDeliveryType());
        resp.setSecurityMethod(entity.getSecurityMethod());
        resp.setEmailRecipients(entity.getEmailRecipients());
        resp.setEmailSubject(entity.getEmailSubject());
        resp.setEmailMessage(entity.getEmailMessage());
        resp.setFileName(entity.getFileName());
        resp.setAuthStatus(entity.getAuthStatus());
        resp.setMakerId(entity.getMakerId());
        resp.setCheckerId(entity.getCheckerId());
        resp.setRejectionReason(entity.getRejectionReason());
        resp.setCreatedAt(entity.getCreatedAt());
        resp.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getMakerId() != null) {
            userRepository.findById(entity.getMakerId()).ifPresent(u -> resp.setMakerUsername(u.getUsername()));
        }
        if (entity.getCheckerId() != null) {
            userRepository.findById(entity.getCheckerId()).ifPresent(u -> resp.setCheckerUsername(u.getUsername()));
        }

        return resp;
    }
}
