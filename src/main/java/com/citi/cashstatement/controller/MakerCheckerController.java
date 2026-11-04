package com.citi.cashstatement.controller;

import com.citi.cashstatement.dto.MakerCheckerApprovalRequest;
import com.citi.cashstatement.entity.MakerCheckerRequest;
import com.citi.cashstatement.service.MakerCheckerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cash-statements/authorizations")
public class MakerCheckerController {

    private final MakerCheckerService makerCheckerService;

    public MakerCheckerController(MakerCheckerService makerCheckerService) {
        this.makerCheckerService = makerCheckerService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<MakerCheckerRequest>> getPendingAuthorizations() {
        return ResponseEntity.ok(makerCheckerService.getPendingRequests());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable String id,
            @RequestBody(required = false) MakerCheckerApprovalRequest approvalRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_checker_202") String checkerId) {
        String comments = approvalRequest != null ? approvalRequest.getComments() : "Approved";
        MakerCheckerRequest approved = makerCheckerService.approveRequest(id, checkerId, comments);

        Map<String, Object> response = new HashMap<>();
        response.put("authorization_id", approved.getId());
        response.put("resource_type", approved.getResourceType());
        response.put("resource_id", approved.getResourceId());
        response.put("status", approved.getStatus());
        response.put("maker_user_id", approved.getMakerId());
        response.put("checker_user_id", approved.getCheckerId());
        response.put("authorized_at", approved.getReviewedAt() != null ? approved.getReviewedAt() : OffsetDateTime.now());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable String id,
            @RequestBody(required = false) MakerCheckerApprovalRequest approvalRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_checker_202") String checkerId) {
        String comments = approvalRequest != null ? approvalRequest.getComments() : "Rejected";
        MakerCheckerRequest rejected = makerCheckerService.rejectRequest(id, checkerId, comments);

        Map<String, Object> response = new HashMap<>();
        response.put("authorization_id", rejected.getId());
        response.put("resource_type", rejected.getResourceType());
        response.put("resource_id", rejected.getResourceId());
        response.put("status", rejected.getStatus());
        response.put("maker_user_id", rejected.getMakerId());
        response.put("checker_user_id", rejected.getCheckerId());
        response.put("reviewed_at", rejected.getReviewedAt() != null ? rejected.getReviewedAt() : OffsetDateTime.now());

        return ResponseEntity.ok(response);
    }
}
