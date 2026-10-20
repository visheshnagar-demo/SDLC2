package com.genre.qtb.repository;

import com.genre.qtb.model.PolicyBinderEntity;
import com.genre.qtb.model.QuoteEntity;
import com.genre.qtb.model.RiskExposureEntity;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryMockRepository {

    private final Map<UUID, QuoteEntity> quotes = new ConcurrentHashMap<>();
    private final Map<UUID, RiskExposureEntity> risks = new ConcurrentHashMap<>();
    private final Map<UUID, PolicyBinderEntity> binders = new ConcurrentHashMap<>();

    // Quotes
    public List<QuoteEntity> findAllQuotes() {
        return new ArrayList<>(quotes.values());
    }

    public Optional<QuoteEntity> findQuoteById(UUID id) {
        return Optional.ofNullable(quotes.get(id));
    }

    public QuoteEntity saveQuote(QuoteEntity quote) {
        if (quote.getId() == null) {
            quote.setId(UUID.randomUUID());
        }
        quotes.put(quote.getId(), quote);
        return quote;
    }

    public List<QuoteEntity> findQuotesByFilter(String status, String lineOfBusiness) {
        return quotes.values().stream()
                .filter(q -> status == null || status.isBlank() || q.getStatus().equalsIgnoreCase(status))
                .filter(q -> lineOfBusiness == null || lineOfBusiness.isBlank() || q.getLineOfBusiness().equalsIgnoreCase(lineOfBusiness))
                .sorted(Comparator.comparing(QuoteEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    // Risks
    public List<RiskExposureEntity> findAllRisks() {
        return new ArrayList<>(risks.values());
    }

    public Optional<RiskExposureEntity> findRiskById(UUID id) {
        return Optional.ofNullable(risks.get(id));
    }

    public Optional<RiskExposureEntity> findRiskByQuoteId(UUID quoteId) {
        return risks.values().stream()
                .filter(r -> r.getQuoteId() != null && r.getQuoteId().equals(quoteId))
                .findFirst();
    }

    public RiskExposureEntity saveRisk(RiskExposureEntity risk) {
        if (risk.getId() == null) {
            risk.setId(UUID.randomUUID());
        }
        risks.put(risk.getId(), risk);
        return risk;
    }

    // Binders
    public List<PolicyBinderEntity> findAllBinders() {
        return new ArrayList<>(binders.values());
    }

    public Optional<PolicyBinderEntity> findBinderById(UUID id) {
        return Optional.ofNullable(binders.get(id));
    }

    public Optional<PolicyBinderEntity> findBinderByQuoteId(UUID quoteId) {
        return binders.values().stream()
                .filter(b -> b.getQuoteId() != null && b.getQuoteId().equals(quoteId))
                .findFirst();
    }

    public PolicyBinderEntity saveBinder(PolicyBinderEntity binder) {
        if (binder.getId() == null) {
            binder.setId(UUID.randomUUID());
        }
        binders.put(binder.getId(), binder);
        return binder;
    }

    // Stats
    public int getQuotesCount() {
        return quotes.size();
    }

    public int getRisksCount() {
        return risks.size();
    }

    public int getBindersCount() {
        return binders.size();
    }
}
