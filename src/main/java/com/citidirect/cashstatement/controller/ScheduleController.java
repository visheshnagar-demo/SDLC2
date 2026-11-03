package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.AuthorizationRequest;
import com.citidirect.cashstatement.dto.ScheduleRequest;
import com.citidirect.cashstatement.dto.ScheduleResponse;
import com.citidirect.cashstatement.security.JwtUtil;
import com.citidirect.cashstatement.service.DeliveryOptionsService;
import com.citidirect.cashstatement.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final DeliveryOptionsService deliveryOptionsService;
    private final JwtUtil jwtUtil;

    public ScheduleController(ScheduleService scheduleService,
                              DeliveryOptionsService deliveryOptionsService,
                              JwtUtil jwtUtil) {
        this.scheduleService = scheduleService;
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
    public ResponseEntity<List<ScheduleResponse>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(
            @RequestBody ScheduleRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String makerId = getUserId(authHeader, "user-maker-01");
        ScheduleResponse response = scheduleService.createSchedule(request, makerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/authorize")
    public ResponseEntity<Object> authorizeSchedule(
            @PathVariable String id,
            @RequestBody(required = false) AuthorizationRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String checkerId = getUserId(authHeader, "user-checker-01");
        Object result = deliveryOptionsService.authorizeEntity(id, request, checkerId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Object> rejectSchedule(
            @PathVariable String id,
            @RequestBody AuthorizationRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String checkerId = getUserId(authHeader, "user-checker-01");
        Object result = deliveryOptionsService.rejectEntity(id, request, checkerId);
        return ResponseEntity.ok(result);
    }
}
