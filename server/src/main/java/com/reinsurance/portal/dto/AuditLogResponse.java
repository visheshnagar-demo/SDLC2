package com.reinsurance.portal.dto;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
    UUID id,
    UUID submissionId,
    String actionType,
    String userId,
    String userRole,
    String changeSummary,
    String previousState,
    String newState,
    Instant timestamp
) {}
