package com.reinsurance.portal.controller;

import com.reinsurance.portal.config.ScoringRulesConfig;
import com.reinsurance.portal.service.ValidationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
@Tag(name = "Configuration", description = "Endpoints for scoring rules and required document configurations")
public class ConfigController {

    private final ScoringRulesConfig scoringRulesConfig;
    private final ValidationService validationService;

    public ConfigController(ScoringRulesConfig scoringRulesConfig, ValidationService validationService) {
        this.scoringRulesConfig = scoringRulesConfig;
        this.validationService = validationService;
    }

    @GetMapping("/scoring-rules")
    @Operation(summary = "Fetch line-of-business risk scoring parameters and weights")
    public ResponseEntity<Map<String, Object>> getScoringRules() {
        Map<String, Object> config = new HashMap<>();
        config.put("rulesByLine", scoringRulesConfig.getRulesByLine());
        return ResponseEntity.ok(config);
    }

    @GetMapping("/required-documents")
    @Operation(summary = "Get required document types for a specific line of business")
    public ResponseEntity<List<String>> getRequiredDocuments(@RequestParam(required = false, defaultValue = "CYBER_RISK") String lineOfBusiness) {
        List<String> requiredDocs = validationService.getRequiredDocumentsForLob(lineOfBusiness);
        return ResponseEntity.ok(requiredDocs);
    }
}
