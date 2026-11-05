package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.AuthorizeRequestDTO;
import com.citidirect.cashstatement.dto.DeliveryOptionDTO;
import com.citidirect.cashstatement.service.MakerCheckerWorkflowService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-options")
@CrossOrigin(origins = "*")
public class DeliveryOptionController {

    private final MakerCheckerWorkflowService makerCheckerWorkflowService;

    public DeliveryOptionController(MakerCheckerWorkflowService makerCheckerWorkflowService) {
        this.makerCheckerWorkflowService = makerCheckerWorkflowService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryOptionDTO>> getAllDeliveryOptions() {
        List<DeliveryOptionDTO> options = makerCheckerWorkflowService.getAllDeliveryOptions();
        return ResponseEntity.ok(options);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<DeliveryOptionDTO>> getPendingDeliveryOptions() {
        List<DeliveryOptionDTO> pending = makerCheckerWorkflowService.getPendingDeliveryOptions();
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryOptionDTO> getDeliveryOptionById(@PathVariable String id) {
        DeliveryOptionDTO option = makerCheckerWorkflowService.getDeliveryOptionById(id);
        return ResponseEntity.ok(option);
    }

    @PostMapping
    public ResponseEntity<DeliveryOptionDTO> createDeliveryOption(
            @RequestBody DeliveryOptionDTO dto,
            Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : dto.getMakerId();
        String userName = dto.getMakerName() != null ? dto.getMakerName() : "M. Sterling (Senior Treasury Analyst)";
        DeliveryOptionDTO created = makerCheckerWorkflowService.createDeliveryOption(dto, userId, userName);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/authorize")
    public ResponseEntity<DeliveryOptionDTO> authorizeDeliveryOption(
            @PathVariable String id,
            @RequestBody(required = false) AuthorizeRequestDTO request,
            Authentication authentication) {
        String comments = request != null && request.getComments() != null ? request.getComments() : "Verified and approved.";
        String checkerId = authentication != null ? authentication.getName() : "usr_checker_01";
        String checkerName = "J. Vance (Tier 4 Authorizer)";

        DeliveryOptionDTO authorized = makerCheckerWorkflowService.authorizeDeliveryOption(id, comments, checkerId, checkerName);
        return ResponseEntity.ok(authorized);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DeliveryOptionDTO> rejectDeliveryOption(
            @PathVariable String id,
            @RequestBody(required = false) AuthorizeRequestDTO request,
            Authentication authentication) {
        String comments = request != null && request.getComments() != null ? request.getComments() : "Rejected by checker.";
        String checkerId = authentication != null ? authentication.getName() : "usr_checker_01";
        String checkerName = "J. Vance (Tier 4 Authorizer)";

        DeliveryOptionDTO rejected = makerCheckerWorkflowService.rejectDeliveryOption(id, comments, checkerId, checkerName);
        return ResponseEntity.ok(rejected);
    }
}
