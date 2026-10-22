package com.reinsurance.portal.controller;

import com.reinsurance.portal.dto.DashboardMetricsResponse;
import com.reinsurance.portal.service.DashboardAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Endpoints for executive portfolio analytics and manager KPI reporting")
public class DashboardController {

    private final DashboardAnalyticsService dashboardAnalyticsService;

    public DashboardController(DashboardAnalyticsService dashboardAnalyticsService) {
        this.dashboardAnalyticsService = dashboardAnalyticsService;
    }

    @GetMapping("/metrics")
    @Operation(summary = "Retrieve executive analytics and portfolio metrics")
    public ResponseEntity<DashboardMetricsResponse> getDashboardMetrics() {
        DashboardMetricsResponse metrics = dashboardAnalyticsService.getMetrics();
        return ResponseEntity.ok(metrics);
    }
}
