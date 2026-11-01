package com.citidirect.cashstatement.execution;

import com.citidirect.cashstatement.auth.UserPrincipal;
import com.citidirect.cashstatement.execution.dto.ExecutionResponse;
import com.citidirect.cashstatement.execution.dto.RunReportRequest;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportExecutionController {

    private final ReportExecutionService executionService;

    public ReportExecutionController(ReportExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping("/execution/run")
    public ResponseEntity<?> runReport(
            @RequestBody RunReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "usr-001";
        String username = principal != null ? principal.getUsername() : "maker_user";

        try {
            String format = request.getOverrideFormat();
            if ("JSON".equalsIgnoreCase(format)) {
                StatementReportData reportData = executionService.getReportDataJson(request, username);
                return ResponseEntity.ok(reportData);
            }

            ReportExecutionService.ExportResult result = executionService.executeReport(request, userId, username);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(result.getContentType()));
            headers.setContentDispositionFormData("attachment", result.getFilename());
            headers.set("X-Execution-Id", result.getExecutionId());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new ByteArrayResource(result.getData()));
        } catch (AccessDeniedException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, ex.getMessage(), ex);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Report execution failed: " + ex.getMessage(), ex);
        }
    }

    @PostMapping("/export")
    public ResponseEntity<ByteArrayResource> exportReport(
            @RequestBody RunReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "usr-001";
        String username = principal != null ? principal.getUsername() : "maker_user";

        try {
            ReportExecutionService.ExportResult result = executionService.executeReport(request, userId, username);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(result.getContentType()));
            headers.setContentDispositionFormData("attachment", result.getFilename());
            headers.set("X-Execution-Id", result.getExecutionId());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new ByteArrayResource(result.getData()));
        } catch (AccessDeniedException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, ex.getMessage(), ex);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Export generation failed: " + ex.getMessage(), ex);
        }
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<ExecutionResponse>> getMyReports(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(executionService.getMyReports(userId));
    }

    @GetMapping("/my-reports/{executionId}/download")
    public ResponseEntity<ByteArrayResource> downloadReport(
            @PathVariable String executionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String username = principal != null ? principal.getUsername() : "maker_user";
        try {
            ReportExecutionService.ExportResult result = executionService.downloadReport(executionId, username);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(result.getContentType()));
            headers.setContentDispositionFormData("attachment", result.getFilename());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new ByteArrayResource(result.getData()));
        } catch (AccessDeniedException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, ex.getMessage(), ex);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Report download failed: " + ex.getMessage(), ex);
        }
    }
}
