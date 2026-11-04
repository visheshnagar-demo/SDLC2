package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.config.JwtUtils;
import com.citidirect.cashstatement.dto.AuthorizeRequestDTO;
import com.citidirect.cashstatement.dto.DeliveryOptionDTO;
import com.citidirect.cashstatement.entity.DeliveryOption;
import com.citidirect.cashstatement.entity.User;
import com.citidirect.cashstatement.repository.UserRepository;
import com.citidirect.cashstatement.service.MakerCheckerWorkflowService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-options")
public class DeliveryOptionController {

    private final MakerCheckerWorkflowService makerCheckerWorkflowService;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public DeliveryOptionController(MakerCheckerWorkflowService makerCheckerWorkflowService,
                                    UserRepository userRepository,
                                    JwtUtils jwtUtils) {
        this.makerCheckerWorkflowService = makerCheckerWorkflowService;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    private String resolveUserId(String authHeader, String fallbackRole) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                return jwtUtils.getUserIdFromToken(token);
            }
        }
        User defaultUser = "ROLE_CHECKER".equalsIgnoreCase(fallbackRole)
                ? userRepository.findByEmail("checker@example.com").orElse(null)
                : userRepository.findByEmail("test@example.com").orElse(null);
        return defaultUser != null ? defaultUser.getId() : "system-user";
    }

    @GetMapping
    public ResponseEntity<List<DeliveryOption>> getAllDeliveryOptions() {
        return ResponseEntity.ok(makerCheckerWorkflowService.getAllDeliveryOptions());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<DeliveryOption>> getPendingDeliveryOptions() {
        return ResponseEntity.ok(makerCheckerWorkflowService.getPendingDeliveryOptions());
    }

    @PostMapping
    public ResponseEntity<DeliveryOption> createDeliveryOption(
            @RequestBody DeliveryOptionDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        String makerId = resolveUserId(authHeader, "ROLE_MAKER");
        String clientIp = request.getRemoteAddr();
        DeliveryOption created = makerCheckerWorkflowService.createDeliveryOption(dto, makerId, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/authorize")
    public ResponseEntity<DeliveryOption> authorizeDeliveryOption(
            @PathVariable("id") String id,
            @RequestBody(required = false) AuthorizeRequestDTO authorizeRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        String checkerId = resolveUserId(authHeader, "ROLE_CHECKER");
        String clientIp = request.getRemoteAddr();
        DeliveryOption authorized = makerCheckerWorkflowService.authorizeDeliveryOption(id, authorizeRequest, checkerId, clientIp);
        return ResponseEntity.ok(authorized);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DeliveryOption> rejectDeliveryOption(
            @PathVariable("id") String id,
            @RequestBody(required = false) AuthorizeRequestDTO authorizeRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        String checkerId = resolveUserId(authHeader, "ROLE_CHECKER");
        String clientIp = request.getRemoteAddr();
        DeliveryOption rejected = makerCheckerWorkflowService.rejectDeliveryOption(id, authorizeRequest, checkerId, clientIp);
        return ResponseEntity.ok(rejected);
    }
}
