package com.citidirect.cashstatement.criteria;

import com.citidirect.cashstatement.auth.UserPrincipal;
import com.citidirect.cashstatement.criteria.dto.DefaultCriteriaResponse;
import com.citidirect.cashstatement.criteria.dto.DerivedReportRequest;
import com.citidirect.cashstatement.criteria.dto.DerivedReportResponse;
import com.citidirect.cashstatement.criteria.model.BaseReport;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportCriteriaController {

    private final DerivedReportService derivedReportService;

    public ReportCriteriaController(DerivedReportService derivedReportService) {
        this.derivedReportService = derivedReportService;
    }

    @GetMapping("/base")
    public ResponseEntity<List<BaseReport>> getBaseReports() {
        return ResponseEntity.ok(derivedReportService.getBaseReportsCatalog());
    }

    @GetMapping("/criteria/defaults")
    public ResponseEntity<DefaultCriteriaResponse> getCriteriaDefaults() {
        return ResponseEntity.ok(derivedReportService.getDefaults());
    }

    @PostMapping("/criteria")
    public ResponseEntity<DerivedReportResponse> createCriteria(
            @Valid @RequestBody DerivedReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String username = principal != null ? principal.getUsername() : "JUSTIN,JOHN";
        DerivedReportResponse response = derivedReportService.createDerivedReport(request, username);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/criteria/{id}")
    public ResponseEntity<DerivedReportResponse> getCriteria(@PathVariable String id) {
        return ResponseEntity.ok(derivedReportService.getDerivedReport(id));
    }

    @PutMapping("/criteria/{id}")
    public ResponseEntity<DerivedReportResponse> updateCriteria(
            @PathVariable String id,
            @Valid @RequestBody DerivedReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String username = principal != null ? principal.getUsername() : "JUSTIN,JOHN";
        return ResponseEntity.ok(derivedReportService.updateDerivedReport(id, request, username));
    }

    @GetMapping("/criteria")
    public ResponseEntity<List<DerivedReportResponse>> listCriteria(@AuthenticationPrincipal UserPrincipal principal) {
        String username = principal != null ? principal.getUsername() : "JUSTIN,JOHN";
        return ResponseEntity.ok(derivedReportService.listDerivedReports(username));
    }

    @DeleteMapping("/criteria/{id}")
    public ResponseEntity<Void> deleteCriteria(@PathVariable String id) {
        derivedReportService.deleteDerivedReport(id);
        return ResponseEntity.noContent().build();
    }
}
