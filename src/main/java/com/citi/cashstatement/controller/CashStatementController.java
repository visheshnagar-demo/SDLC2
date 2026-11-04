package com.citi.cashstatement.controller;

import com.citi.cashstatement.dto.ExportRequest;
import com.citi.cashstatement.dto.StatementGenerateRequest;
import com.citi.cashstatement.dto.StatementGenerateResponse;
import com.citi.cashstatement.service.CashStatementService;
import com.citi.cashstatement.service.ExportEngineService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cash-statements")
public class CashStatementController {

    private final CashStatementService cashStatementService;
    private final ExportEngineService exportEngineService;

    public CashStatementController(CashStatementService cashStatementService, ExportEngineService exportEngineService) {
        this.cashStatementService = cashStatementService;
        this.exportEngineService = exportEngineService;
    }

    @PostMapping("/generate")
    public ResponseEntity<StatementGenerateResponse> generateStatement(
            @RequestBody(required = false) StatementGenerateRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_maker_101") String userId) {
        if (request == null) {
            request = new StatementGenerateRequest();
        }
        StatementGenerateResponse response = cashStatementService.generateStatement(request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/export")
    public ResponseEntity<?> exportStatement(
            @RequestBody(required = false) ExportRequest request,
            @RequestParam(value = "async", defaultValue = "false") boolean async,
            @RequestHeader(value = "X-User-Id", defaultValue = "usr_maker_101") String userId) {
        if (request == null) {
            request = new ExportRequest();
        }

        if (async) {
            String jobId = exportEngineService.triggerAsyncExport(request, userId);
            Map<String, Object> resp = new HashMap<>();
            resp.put("job_id", jobId);
            resp.put("status", "ACCEPTED");
            resp.put("poll_url", "/api/v1/cash-statements/export-jobs/" + jobId);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(resp);
        }

        byte[] fileData = exportEngineService.generateExportFile(request, userId);
        String format = request.getExportFormat() != null ? request.getExportFormat().toUpperCase() : "CSV";

        String contentType = "text/csv";
        String filename = "cash_statement." + format.toLowerCase();
        if ("EXCEL".equals(format) || "XLSX".equals(format)) {
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            filename = "cash_statement.xlsx";
        } else if ("PDF".equals(format)) {
            contentType = "application/pdf";
            filename = "cash_statement.pdf";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileData);
    }

    @GetMapping("/export-jobs/{jobId}")
    public ResponseEntity<?> getExportJobStatus(@PathVariable String jobId) {
        ExportEngineService.ExportJobInfo job = exportEngineService.getExportJob(jobId);
        if (job == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Export job not found");
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("job_id", job.jobId);
        resp.put("status", job.status);
        resp.put("download_url", job.downloadUrl);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/export-jobs/{jobId}/download")
    public ResponseEntity<byte[]> downloadExportJob(@PathVariable String jobId) {
        ExportEngineService.ExportJobInfo job = exportEngineService.getExportJob(jobId);
        if (job == null || job.data == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Export job data not available");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"statement_export_" + jobId + "." + (job.format != null ? job.format.toLowerCase() : "csv") + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(job.data);
    }
}
