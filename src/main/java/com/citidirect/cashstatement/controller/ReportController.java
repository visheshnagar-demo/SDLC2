package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.ReportResponse;
import com.citidirect.cashstatement.dto.ReportSearchRequest;
import com.citidirect.cashstatement.security.JwtUtil;
import com.citidirect.cashstatement.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final JwtUtil jwtUtil;

    public ReportController(ReportService reportService, JwtUtil jwtUtil) {
        this.reportService = reportService;
        this.jwtUtil = jwtUtil;
    }

    private String getActorId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                return jwtUtil.extractUserId(authHeader.substring(7));
            } catch (Exception ignored) {}
        }
        return "user-maker-01";
    }

    @GetMapping
    public ResponseEntity<List<ReportResponse>> searchReports(
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) String branchCode,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        ReportSearchRequest req = new ReportSearchRequest();
        req.setAccountNumber(accountNumber);
        req.setBranchCode(branchCode);
        req.setCustomerId(customerId);
        req.setStatus(status);
        req.setCurrency(currency);
        req.setFromDate(fromDate);
        req.setToDate(toDate);

        return ResponseEntity.ok(reportService.searchReports(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable String id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<ReportResponse> generateReport(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String actorId = getActorId(authHeader);
        ReportResponse response = reportService.generateReport(id, actorId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String id,
            @RequestParam(defaultValue = "PDF") String format,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String actorId = getActorId(authHeader);
        byte[] data = reportService.exportReport(id, format, actorId);

        HttpHeaders headers = new HttpHeaders();
        if ("PDF".equalsIgnoreCase(format)) {
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "statement-" + id + ".pdf");
        } else if ("EXCEL".equalsIgnoreCase(format) || "XLSX".equalsIgnoreCase(format)) {
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "statement-" + id + ".xlsx");
        } else if ("CSV".equalsIgnoreCase(format)) {
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "statement-" + id + ".csv");
        }

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
