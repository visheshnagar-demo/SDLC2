package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.AuthorizationRequest;
import com.citidirect.cashstatement.dto.DeliveryOptionRequest;
import com.citidirect.cashstatement.dto.DeliveryOptionResponse;
import com.citidirect.cashstatement.security.JwtUtil;
import com.citidirect.cashstatement.service.DeliveryOptionsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-options")
public class DeliveryOptionsController {

    private final DeliveryOptionsService deliveryOptionsService;
    private final JwtUtil jwtUtil;

    public DeliveryOptionsController(DeliveryOptionsService deliveryOptionsService, JwtUtil jwtUtil) {
        this.deliveryOptionsService = deliveryOptionsService;
        this.jwtUtil = jwtUtil;
    }

    private String getUserId(String authHeader, String fallback) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                return jwtUtil.extractUserId(authHeader.substring(7));
            } catch (Exception ignored) {}
        }
        return fallback;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryOptionResponse>> getAllDeliveryOptions() {
        return ResponseEntity.ok(deliveryOptionsService.getAllDeliveryOptions());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<DeliveryOptionResponse>> getPendingDeliveryOptions() {
        return ResponseEntity.ok(deliveryOptionsService.getPendingDeliveryOptions());
    }

    @PostMapping
    public ResponseEntity<DeliveryOptionResponse> createDeliveryOption(
            @RequestBody DeliveryOptionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String makerId = getUserId(authHeader, "user-maker-01");
        DeliveryOptionResponse response = deliveryOptionsService.createDeliveryOption(request, makerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/authorize")
    public ResponseEntity<Object> authorizeDeliveryOption(
            @PathVariable String id,
            @RequestBody(required = false) AuthorizationRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String checkerId = getUserId(authHeader, "user-checker-01");
        Object result = deliveryOptionsService.authorizeEntity(id, request, checkerId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Object> rejectDeliveryOption(
            @PathVariable String id,
            @RequestBody AuthorizationRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String checkerId = getUserId(authHeader, "user-checker-01");
        Object result = deliveryOptionsService.rejectEntity(id, request, checkerId);
        return ResponseEntity.ok(result);
    }
}
