package com.reinsurance.portal.controller;

import com.reinsurance.portal.dto.DashboardMetricsResponse;
import com.reinsurance.portal.service.DashboardAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Executive underwriting portfolio analytics")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardAnalyticsService dashboardService;

    public DashboardController(DashboardAnalyticsService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    @Operation(summary = "Retrieve executive analytics and portfolio metrics")
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        DashboardMetricsResponse response = dashboardService.getMetrics();
        return ResponseEntity.ok(response);
    }
}
