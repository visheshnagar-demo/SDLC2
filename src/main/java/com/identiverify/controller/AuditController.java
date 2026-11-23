package com.identiverify.controller;

import com.identiverify.dto.AuditLogResponse;
import com.identiverify.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs(
            @RequestParam(value = "entityName", required = false) String entityName,
            @RequestParam(value = "actorId", required = false) UUID actorId) {
        List<AuditLogResponse> logs = auditService.getAllLogs(entityName, actorId);
        return ResponseEntity.ok(logs);
    }
}
