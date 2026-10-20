package com.genre.qtb.controller;

import com.genre.qtb.dto.RiskExposureResponse;
import com.genre.qtb.dto.UnderwritingDecisionRequest;
import com.genre.qtb.service.RiskStructuringService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/risks")
public class RiskController {

    private final RiskStructuringService riskService;

    public RiskController(RiskStructuringService riskService) {
        this.riskService = riskService;
    }

    @GetMapping
    public ResponseEntity<List<RiskExposureResponse>> getAllRisks() {
        List<RiskExposureResponse> risks = riskService.getAllRisks();
        return ResponseEntity.ok(risks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskExposureResponse> getRiskById(@PathVariable UUID id) {
        RiskExposureResponse risk = riskService.getRiskById(id);
        return ResponseEntity.ok(risk);
    }

    @PatchMapping("/{id}/decision")
    public ResponseEntity<RiskExposureResponse> updateDecision(
            @PathVariable UUID id,
            @Valid @RequestBody UnderwritingDecisionRequest request) {
        RiskExposureResponse updated = riskService.updateUnderwritingDecision(id, request);
        return ResponseEntity.ok(updated);
    }
}
