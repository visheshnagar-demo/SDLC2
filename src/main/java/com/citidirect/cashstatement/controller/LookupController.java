package com.citidirect.cashstatement.controller;

import com.citidirect.cashstatement.dto.LookupAccountDTO;
import com.citidirect.cashstatement.dto.LookupBranchDTO;
import com.citidirect.cashstatement.dto.LookupCustomerDTO;
import com.citidirect.cashstatement.entity.BaseReport;
import com.citidirect.cashstatement.service.LookupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lookup")
@CrossOrigin(origins = "*")
public class LookupController {

    private final LookupService lookupService;

    public LookupController(LookupService lookupService) {
        this.lookupService = lookupService;
    }

    @GetMapping("/branches")
    public ResponseEntity<List<LookupBranchDTO>> getBranches() {
        return ResponseEntity.ok(lookupService.getBranches());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<LookupCustomerDTO>> getCustomers() {
        return ResponseEntity.ok(lookupService.getCustomers());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<LookupAccountDTO>> getAccounts() {
        return ResponseEntity.ok(lookupService.getAccounts());
    }

    @GetMapping("/report-names")
    public ResponseEntity<List<BaseReport>> getReportNames() {
        return ResponseEntity.ok(lookupService.getReportNames());
    }
}
