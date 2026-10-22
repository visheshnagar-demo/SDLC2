package com.reinsurance.portal.controller;

import com.reinsurance.portal.config.ScoringRulesConfig;
import com.reinsurance.portal.entity.UnderwritingAuthorityEntity;
import com.reinsurance.portal.repository.UnderwritingAuthorityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
@Tag(name = "Configuration", description = "Scoring rules and authority limits configuration")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final ScoringRulesConfig scoringRulesConfig;
    private final UnderwritingAuthorityRepository authorityRepository;

    public ConfigController(ScoringRulesConfig scoringRulesConfig,
                            UnderwritingAuthorityRepository authorityRepository) {
        this.scoringRulesConfig = scoringRulesConfig;
        this.authorityRepository = authorityRepository;
    }

    @GetMapping("/scoring-rules")
    @Operation(summary = "Fetch line-of-business risk scoring parameters")
    public ResponseEntity<Map<String, Object>> getScoringRules() {
        Map<String, Object> rules = new HashMap<>();
        rules.put("cyberWeights", scoringRulesConfig.getCyberWeights());
        rules.put("doWeights", scoringRulesConfig.getDoWeights());
        return ResponseEntity.ok(rules);
    }

    @GetMapping("/authorities")
    @Operation(summary = "Fetch underwriter authority limits")
    public ResponseEntity<List<UnderwritingAuthorityEntity>> getAuthorities() {
        List<UnderwritingAuthorityEntity> list = authorityRepository.findAll();
        if (list.isEmpty()) {
            UnderwritingAuthorityEntity defaultUw = new UnderwritingAuthorityEntity();
            defaultUw.setRoleName("UNDERWRITER");
            defaultUw.setMaxPolicyLimit(BigDecimal.valueOf(5000000.00));
            list = List.of(defaultUw);
        }
        return ResponseEntity.ok(list);
    }
}
