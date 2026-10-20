package com.genre.qtb.service;

import com.genre.qtb.dto.BinderRequest;
import com.genre.qtb.dto.BinderResponse;
import com.genre.qtb.model.PolicyBinderEntity;
import com.genre.qtb.model.QuoteEntity;
import com.genre.qtb.repository.InMemoryMockRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class BinderWorkflowService {

    private final InMemoryMockRepository repository;
    private final AtomicInteger binderSequence = new AtomicInteger(88413);

    public BinderWorkflowService(InMemoryMockRepository repository) {
        this.repository = repository;
    }

    public List<BinderResponse> getAllBinders() {
        return repository.findAllBinders().stream().map(binder -> {
            QuoteEntity quote = repository.findQuoteById(binder.getQuoteId()).orElse(null);
            return BinderResponse.fromEntity(binder, quote);
        }).collect(Collectors.toList());
    }

    public BinderResponse getBinderById(UUID id) {
        PolicyBinderEntity binder = repository.findBinderById(id)
                .orElseThrow(() -> new NoSuchElementException("Policy binder not found with ID: " + id));
        QuoteEntity quote = repository.findQuoteById(binder.getQuoteId()).orElse(null);
        return BinderResponse.fromEntity(binder, quote);
    }

    public BinderResponse createBinder(BinderRequest request) {
        QuoteEntity quote = repository.findQuoteById(request.getQuoteId())
                .orElseThrow(() -> new NoSuchElementException("Quote not found for ID: " + request.getQuoteId()));

        PolicyBinderEntity binder = new PolicyBinderEntity();
        binder.setId(UUID.randomUUID());
        binder.setQuoteId(quote.getId());
        binder.setPolicyReferenceId("GENRE-QTB-2026-" + binderSequence.getAndIncrement());
        binder.setEffectiveDate(request.getEffectiveDate() != null ? request.getEffectiveDate() : LocalDate.now());
        binder.setExpiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : LocalDate.now().plusYears(1));
        binder.setBoundBy(request.getBoundBy() != null && !request.getBoundBy().isBlank() ? request.getBoundBy() : "UW-4091");
        binder.setBindingTimestamp(Instant.now());
        binder.setStatus("BOUND");

        Map<String, Object> documentSummary = new LinkedHashMap<>();
        documentSummary.put("binderTitle", "Gen Re Treaty Reinsurance Binder Certificate");
        documentSummary.put("jurisdiction", "State of New York, USA");
        documentSummary.put("securityRating", "S&P AA+ / A.M. Best A++");
        documentSummary.put("specialConditions", Arrays.asList(
                "Quarterly loss bordereau reporting required within 30 days of quarter close.",
                "Sanctions limitation and exclusion clause LMA3100 applies.",
                "Premium installment schedule: 4 equal quarterly payments."
        ));
        binder.setDocumentSummary(documentSummary);

        repository.saveBinder(binder);

        // Update quote status
        quote.setStatus("BOUND");
        quote.setUpdatedAt(Instant.now());
        repository.saveQuote(quote);

        return BinderResponse.fromEntity(binder, quote);
    }
}
