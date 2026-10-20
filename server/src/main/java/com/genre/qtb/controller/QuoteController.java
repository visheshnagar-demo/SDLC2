package com.genre.qtb.controller;

import com.genre.qtb.dto.QuoteRequest;
import com.genre.qtb.dto.QuoteResponse;
import com.genre.qtb.service.QuotePricingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quotes")
public class QuoteController {

    private final QuotePricingService quoteService;

    public QuoteController(QuotePricingService quoteService) {
        this.quoteService = quoteService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getQuotes(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String lineOfBusiness,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = quoteService.getQuotes(status, lineOfBusiness, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuoteResponse> getQuoteById(@PathVariable UUID id) {
        QuoteResponse quote = quoteService.getQuoteById(id);
        return ResponseEntity.ok(quote);
    }

    @PostMapping
    public ResponseEntity<QuoteResponse> createQuote(@Valid @RequestBody QuoteRequest request) {
        QuoteResponse created = quoteService.createQuote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
