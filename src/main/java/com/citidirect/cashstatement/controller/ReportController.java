package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.ReportRequestDTO;
import com.citidirect.cashstatement.dto.ReportScheduleDTO;
import com.citidirect.cashstatement.entity.GeneratedReport;
import com.citidirect.cashstatement.entity.ReportSchedule;
import com.citidirect.cashstatement.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<GeneratedReport>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String branch) {
        List<GeneratedReport> reports = reportService.getReports(status, branch);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeneratedReport> getReportById(@PathVariable String id) {
        GeneratedReport report = reportService.getReportById(id);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/generate")
    public ResponseEntity<GeneratedReport> generateReport(
            @RequestBody ReportRequestDTO request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "usr_maker_01";
        GeneratedReport report = reportService.generateReport(request, username);
        return new ResponseEntity<>(report, HttpStatus.CREATED);
    }

    @PostMapping("/schedule")
    public ResponseEntity<ReportSchedule> createSchedule(
            @RequestBody ReportScheduleDTO request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "usr_maker_01";
        ReportSchedule schedule = reportService.createSchedule(request, username);
        return new ResponseEntity<>(schedule, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String id,
            @RequestParam(defaultValue = "PDF") String format,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        byte[] data = reportService.exportReport(id, format, username);

        String filename;
        MediaType mediaType;
        String formatUpper = format.toUpperCase();

        if ("EXCEL".equals(formatUpper) || "XLSX".equals(formatUpper)) {
            filename = "Cash_Statement_" + id + ".xlsx";
            mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } else if ("CSV".equals(formatUpper)) {
            filename = "Cash_Statement_" + id + ".csv";
            mediaType = MediaType.parseMediaType("text/csv");
        } else {
            filename = "Cash_Statement_" + id + ".pdf";
            mediaType = MediaType.APPLICATION_PDF;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(data.length);

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
