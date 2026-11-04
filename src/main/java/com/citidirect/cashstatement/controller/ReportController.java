package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.config.JwtUtils;
import com.citidirect.cashstatement.dto.ReportRequestDTO;
import com.citidirect.cashstatement.dto.ReportScheduleDTO;
import com.citidirect.cashstatement.entity.ReportSchedule;
import com.citidirect.cashstatement.entity.User;
import com.citidirect.cashstatement.repository.UserRepository;
import com.citidirect.cashstatement.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public ReportController(ReportService reportService,
                            UserRepository userRepository,
                            JwtUtils jwtUtils) {
        this.reportService = reportService;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    private String resolveUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                return jwtUtils.getUserIdFromToken(token);
            }
        }
        User defaultUser = userRepository.findByEmail("test@example.com").orElse(null);
        return defaultUser != null ? defaultUser.getId() : "default-maker-id";
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getReports(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "status", required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reportService.getReports(status, pageable));
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateReport(
            @RequestBody ReportRequestDTO requestDTO,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        String userId = resolveUserId(authHeader);
        String clientIp = request.getRemoteAddr();
        Map<String, Object> result = reportService.generateReport(requestDTO, userId, clientIp);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(result);
    }

    @PostMapping("/schedule")
    public ResponseEntity<ReportSchedule> scheduleReport(
            @RequestBody ReportScheduleDTO scheduleDTO,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        String userId = resolveUserId(authHeader);
        String clientIp = request.getRemoteAddr();
        ReportSchedule schedule = reportService.scheduleReport(scheduleDTO, userId, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable("id") String id,
            @RequestParam(value = "format", defaultValue = "PDF") String format,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        String userId = resolveUserId(authHeader);
        String clientIp = request.getRemoteAddr();
        byte[] fileBytes = reportService.exportReport(id, format, userId, clientIp);

        String filename;
        String contentType;
        if ("EXCEL".equalsIgnoreCase(format) || "XLSX".equalsIgnoreCase(format)) {
            filename = "Cash_Statement_" + id + ".xlsx";
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else if ("CSV".equalsIgnoreCase(format)) {
            filename = "Cash_Statement_" + id + ".csv";
            contentType = "text/csv";
        } else {
            filename = "Cash_Statement_" + id + ".pdf";
            contentType = "application/pdf";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileBytes);
    }
}
