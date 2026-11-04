package com.citi.cashstatement.controller;

import com.citi.cashstatement.entity.Account;
import com.citi.cashstatement.repository.AccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cash-statements/lookups")
public class LookupController {

    private final AccountRepository accountRepository;

    public LookupController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAccounts() {
        return ResponseEntity.ok(accountRepository.findByIsActiveTrue());
    }

    @GetMapping("/report-templates")
    public ResponseEntity<List<Map<String, String>>> getReportTemplates() {
        List<Map<String, String>> templates = new ArrayList<>();

        Map<String, String> t1 = new HashMap<>();
        t1.put("template_id", "TMPL_CASH_EOD");
        t1.put("report_name", "End of Day Cash Ledger Balance");
        t1.put("classification", "STANDARD");
        t1.put("description", "Comprehensive EOD cash summary across operational corporate accounts");
        t1.put("category", "CASH_MANAGEMENT");
        templates.add(t1);

        Map<String, String> t2 = new HashMap<>();
        t2.put("template_id", "TMPL_INTRADAY_DETAILED");
        t2.put("report_name", "Intraday Real-Time Transaction Detail");
        t2.put("classification", "DETAILED");
        t2.put("description", "Itemized transaction feed including SWIFT, Fedwire, and ACH debits/credits");
        t2.put("category", "TREASURY_OPS");
        templates.add(t2);

        Map<String, String> t3 = new HashMap<>();
        t3.put("template_id", "TMPL_MONTHLY_AUDIT");
        t3.put("report_name", "Monthly Treasury Regulatory Statement");
        t3.put("classification", "REGULATORY");
        t3.put("description", "Certified monthly statement for internal audit and SOC2 compliance");
        t3.put("category", "COMPLIANCE");
        templates.add(t3);

        return ResponseEntity.ok(templates);
    }
}
