package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.LookupResponse;
import com.citidirect.cashstatement.service.LookupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lookup")
public class LookupController {

    private final LookupService lookupService;

    public LookupController(LookupService lookupService) {
        this.lookupService = lookupService;
    }

    @GetMapping("/branches")
    public ResponseEntity<List<LookupResponse>> getBranches(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(lookupService.getBranches(query));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<LookupResponse>> getCustomers(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(lookupService.getCustomers(query));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<LookupResponse>> getAccounts(
            @RequestParam(required = false) String branchCode,
            @RequestParam(required = false) String customerId) {
        return ResponseEntity.ok(lookupService.getAccounts(branchCode, customerId));
    }

    @GetMapping("/report-names")
    public ResponseEntity<List<LookupResponse>> getReportNames(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(lookupService.getReportNames(query));
    }
}
