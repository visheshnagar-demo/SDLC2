package com.citi.cashstatement.controller;

import com.citi.cashstatement.entity.AuditLog;
import com.citi.cashstatement.service.AuditLoggerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cash-statements/audit-logs")
public class AuditLogController {

    private final AuditLoggerService auditLoggerService;

    public AuditLogController(AuditLoggerService auditLoggerService) {
        this.auditLoggerService = auditLoggerService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLoggerService.getAuditLogs(pageable));
    }
}
