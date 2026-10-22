package com.reinsurance.portal.controller;

import com.reinsurance.portal.dto.CreateQuoteRequest;
import com.reinsurance.portal.dto.SubmissionResponse;
import com.reinsurance.portal.service.QuoteBuilderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/submissions")
@Tag(name = "Quotes", description = "Endpoints for formulating and managing reinsurance quotes")
public class QuoteController {

    private final QuoteBuilderService quoteBuilderService;

    public QuoteController(QuoteBuilderService quoteBuilderService) {
        this.quoteBuilderService = quoteBuilderService;
    }

    @PostMapping("/{id}/quotes")
    @Operation(summary = "Create or update a formal reinsurance quote")
    public ResponseEntity<SubmissionResponse> createOrUpdateQuote(
            @PathVariable UUID id,
            @Valid @RequestBody CreateQuoteRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "underwriter") String userId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_UNDERWRITER") String userRole) {
        SubmissionResponse response = quoteBuilderService.createOrUpdateQuote(id, request, userId, userRole);
        return ResponseEntity.ok(response);
    }
}
