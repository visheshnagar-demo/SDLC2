package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.LookupDTO;
import com.citidirect.cashstatement.service.LookupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lookup")
public class LookupController {

    private final LookupService lookupService;

    public LookupController(LookupService lookupService) {
        this.lookupService = lookupService;
    }

    @GetMapping("/branches")
    public ResponseEntity<List<LookupDTO.BranchLookup>> getBranches() {
        return ResponseEntity.ok(lookupService.getBranches());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<LookupDTO.CustomerLookup>> getCustomers() {
        return ResponseEntity.ok(lookupService.getCustomers());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<LookupDTO.AccountLookup>> getAccounts() {
        return ResponseEntity.ok(lookupService.getAccounts());
    }

    @GetMapping("/report-names")
    public ResponseEntity<List<LookupDTO.ReportNameLookup>> getReportNames() {
        return ResponseEntity.ok(lookupService.getReportNames());
    }
}
