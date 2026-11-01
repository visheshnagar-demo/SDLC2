package com.citidirect.cashstatement.execution;

import com.citidirect.cashstatement.auth.UserPrincipal;
import com.citidirect.cashstatement.execution.dto.ExecutionResponse;
import com.citidirect.cashstatement.execution.dto.RunReportRequest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportExecutionController {

    private final ReportExecutionService executionService;

    public ReportExecutionController(ReportExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping("/execution/run")
    public ResponseEntity<ByteArrayResource> runReport(
            @RequestBody RunReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) throws Exception {
        String userId = principal != null ? principal.getId() : "usr-001";
        String username = principal != null ? principal.getUsername() : "JUSTIN,JOHN";

        ReportExecutionService.ExportResult result = executionService.executeReport(request, userId, username);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(result.getContentType()));
        headers.setContentDispositionFormData("attachment", result.getFilename());
        headers.set("X-Execution-Id", result.getExecutionId());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new ByteArrayResource(result.getData()));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<ExecutionResponse>> getMyReports(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(executionService.getMyReports(userId));
    }

    @GetMapping("/my-reports/{executionId}/download")
    public ResponseEntity<ByteArrayResource> downloadReport(@PathVariable String executionId) throws Exception {
        ReportExecutionService.ExportResult result = executionService.downloadReport(executionId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(result.getContentType()));
        headers.setContentDispositionFormData("attachment", result.getFilename());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new ByteArrayResource(result.getData()));
    }
}
