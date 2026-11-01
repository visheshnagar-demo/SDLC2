package com.citidirect.cashstatement.delivery;

import com.citidirect.cashstatement.auth.UserPrincipal;
import com.citidirect.cashstatement.delivery.dto.AuthorizationRequest;
import com.citidirect.cashstatement.delivery.dto.DeliveryOptionRequest;
import com.citidirect.cashstatement.delivery.dto.DeliveryOptionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/delivery-options")
public class DeliveryOptionController {

    private final DeliveryOptionService deliveryOptionService;

    public DeliveryOptionController(DeliveryOptionService deliveryOptionService) {
        this.deliveryOptionService = deliveryOptionService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryOptionResponse>> listDeliveryOptions(@RequestParam(required = false, defaultValue = "ALL") String tab) {
        return ResponseEntity.ok(deliveryOptionService.listDeliveryOptions(tab));
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getTabCounts() {
        return ResponseEntity.ok(deliveryOptionService.getTabCounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryOptionResponse> getDeliveryOption(@PathVariable String id) {
        return ResponseEntity.ok(deliveryOptionService.getDeliveryOption(id));
    }

    @PostMapping
    public ResponseEntity<DeliveryOptionResponse> createDeliveryOption(
            @Valid @RequestBody DeliveryOptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String makerId = principal != null ? principal.getId() : "usr-001";
        DeliveryOptionResponse response = deliveryOptionService.createDeliveryOption(request, makerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryOptionResponse> updateDeliveryOption(
            @PathVariable String id,
            @Valid @RequestBody DeliveryOptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String makerId = principal != null ? principal.getId() : "usr-001";
        return ResponseEntity.ok(deliveryOptionService.updateDeliveryOption(id, request, makerId));
    }

    @PostMapping("/{id}/authorize")
    public ResponseEntity<DeliveryOptionResponse> authorizeDeliveryOption(
            @PathVariable String id,
            @Valid @RequestBody AuthorizationRequest authRequest,
            @AuthenticationPrincipal UserPrincipal principal) {
        String checkerId = principal != null ? principal.getId() : "usr-002";
        return ResponseEntity.ok(deliveryOptionService.authorizeDeliveryOption(id, authRequest, checkerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryOption(@PathVariable String id) {
        deliveryOptionService.deleteDeliveryOption(id);
        return ResponseEntity.noContent().build();
    }
}
