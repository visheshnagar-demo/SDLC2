package com.genre.qtb.service;

import com.genre.qtb.dto.RiskExposureResponse;
import com.genre.qtb.dto.UnderwritingDecisionRequest;
import com.genre.qtb.model.QuoteEntity;
import com.genre.qtb.model.RiskExposureEntity;
import com.genre.qtb.repository.InMemoryMockRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RiskStructuringService {

    private final InMemoryMockRepository repository;

    public RiskStructuringService(InMemoryMockRepository repository) {
        this.repository = repository;
    }

    public List<RiskExposureResponse> getAllRisks() {
        return repository.findAllRisks().stream().map(risk -> {
            QuoteEntity quote = risk.getQuoteId() != null ? repository.findQuoteById(risk.getQuoteId()).orElse(null) : null;
            return RiskExposureResponse.fromEntity(risk, quote);
        }).collect(Collectors.toList());
    }

    public RiskExposureResponse getRiskById(UUID id) {
        RiskExposureEntity risk = repository.findRiskById(id)
                .orElseThrow(() -> new NoSuchElementException("Risk exposure profile not found with ID: " + id));
        QuoteEntity quote = risk.getQuoteId() != null ? repository.findQuoteById(risk.getQuoteId()).orElse(null) : null;
        return RiskExposureResponse.fromEntity(risk, quote);
    }

    public RiskExposureResponse updateUnderwritingDecision(UUID id, UnderwritingDecisionRequest request) {
        RiskExposureEntity risk = repository.findRiskById(id)
                .orElseThrow(() -> new NoSuchElementException("Risk exposure profile not found with ID: " + id));

        String decision = request.getDecision().toUpperCase();
        risk.setUnderwritingDecision(decision);

        if (request.getReviewNotes() != null && !request.getReviewNotes().isBlank()) {
            risk.setUnderwriterNotes(request.getReviewNotes());
        }

        repository.saveRisk(risk);

        // Update the associated quote status if found
        if (risk.getQuoteId() != null) {
            repository.findQuoteById(risk.getQuoteId()).ifPresent(quote -> {
                if ("APPROVED".equalsIgnoreCase(decision)) {
                    quote.setStatus("APPROVED");
                } else if ("DECLINED".equalsIgnoreCase(decision)) {
                    quote.setStatus("DECLINED");
                } else if ("REFERRED".equalsIgnoreCase(decision)) {
                    quote.setStatus("REFERRED");
                }
                quote.setUpdatedAt(Instant.now());
                repository.saveQuote(quote);
            });
        }

        QuoteEntity quote = risk.getQuoteId() != null ? repository.findQuoteById(risk.getQuoteId()).orElse(null) : null;
        return RiskExposureResponse.fromEntity(risk, quote);
    }
}
