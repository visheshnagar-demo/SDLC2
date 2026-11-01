package com.citidirect.cashstatement.system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
public class IntegrationStatusController {

    @GetMapping("/integrations/status")
    public ResponseEntity<Map<String, Object>> getIntegrationStatus() {
        Map<String, Object> status = Map.of(
                "environment", "PROTOTYPE",
                "dataSource", "LOCAL_POSTGRESQL",
                "citiSecureEmail", "UNAVAILABLE_FALLBACK_SMTP",
                "liveCoreBanking", "MOCKED_PROTOTYPE",
                "status", "OPERATIONAL",
                "notice", "This instance operates against local PostgreSQL sample data. External Citi mainframe and Citi Secure Email integrations are unconfigured."
        );
        return ResponseEntity.ok(status);
    }
}
