package com.reinsurance.portal.controller;

import com.reinsurance.portal.dto.CreateQuoteRequest;
import com.reinsurance.portal.dto.QuoteResponse;
import com.reinsurance.portal.service.QuoteBuilderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/submissions/{id}/quotes")
@Tag(name = "Quotes", description = "Reinsurance quote builder and calculation endpoints")
@CrossOrigin(origins = "*")
public class QuoteController {

    private final QuoteBuilderService quoteService;

    public QuoteController(QuoteBuilderService quoteService) {
        this.quoteService = quoteService;
    }

    @PostMapping
    @Operation(summary = "Create or update a formal reinsurance quote")
    public ResponseEntity<QuoteResponse> createQuote(
            @PathVariable("id") UUID submissionId,
            @Valid @RequestBody CreateQuoteRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        String email = userEmail != null ? userEmail : "underwriter@example.com";
        String role = userRole != null ? userRole : "ROLE_UNDERWRITER";
        QuoteResponse response = quoteService.createQuote(submissionId, request, email, role);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all quotes created for a submission")
    public ResponseEntity<List<QuoteResponse>> getQuotes(@PathVariable("id") UUID submissionId) {
        List<QuoteResponse> quotes = quoteService.getQuotesForSubmission(submissionId);
        return ResponseEntity.ok(quotes);
    }
}
