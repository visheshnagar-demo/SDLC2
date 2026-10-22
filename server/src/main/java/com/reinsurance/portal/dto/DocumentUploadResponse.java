package com.reinsurance.portal.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentUploadResponse(
    UUID id,
    UUID submissionId,
    String documentType,
    String fileName,
    String storageUrl,
    String mimeType,
    Long fileSizeBytes,
    Instant createdAt
) {}
