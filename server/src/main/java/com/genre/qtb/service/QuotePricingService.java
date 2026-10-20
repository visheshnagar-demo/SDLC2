package com.genre.qtb.service;

import com.genre.qtb.dto.QuoteRequest;
import com.genre.qtb.dto.QuoteResponse;
import com.genre.qtb.model.LayerStructure;
import com.genre.qtb.model.QuoteEntity;
import com.genre.qtb.model.RiskExposureEntity;
import com.genre.qtb.repository.InMemoryMockRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class QuotePricingService {

    private final InMemoryMockRepository repository;
    private final AtomicInteger quoteSequence = new AtomicInteger(105);

    public QuotePricingService(InMemoryMockRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> getQuotes(String status, String lineOfBusiness, int page, int size) {
        List<QuoteEntity> filtered = repository.findQuotesByFilter(status, lineOfBusiness);
        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<QuoteEntity> pageContent = filtered.subList(fromIndex, toIndex);
        List<QuoteResponse> responses = pageContent.stream().map(q -> {
            Optional<RiskExposureEntity> risk = repository.findRiskByQuoteId(q.getId());
            List<LayerStructure> layers = risk.map(RiskExposureEntity::getLayers).orElse(Collections.emptyList());
            return QuoteResponse.fromEntity(q, layers);
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", responses);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("pageNumber", page);
        result.put("pageSize", size);
        return result;
    }

    public QuoteResponse getQuoteById(UUID id) {
        QuoteEntity quote = repository.findQuoteById(id)
                .orElseThrow(() -> new NoSuchElementException("Quote not found with ID: " + id));
        Optional<RiskExposureEntity> risk = repository.findRiskByQuoteId(quote.getId());
        List<LayerStructure> layers = risk.map(RiskExposureEntity::getLayers).orElse(Collections.emptyList());
        return QuoteResponse.fromEntity(quote, layers);
    }

    public QuoteResponse createQuote(QuoteRequest request) {
        QuoteEntity quote = new QuoteEntity();
        UUID quoteId = UUID.randomUUID();
        quote.setId(quoteId);
        quote.setQuoteNumber("QTB-2026-00" + quoteSequence.getAndIncrement());
        quote.setInsuredName(request.getInsuredName());
        quote.setLineOfBusiness(request.getLineOfBusiness());
        quote.setSumInsured(request.getSumInsured());
        quote.setDeductible(request.getDeductible() != null ? request.getDeductible() : BigDecimal.ZERO);
        quote.setStructureType(request.getStructureType());
        quote.setAttachmentPoint(request.getAttachmentPoint() != null ? request.getAttachmentPoint() : BigDecimal.ZERO);

        // Pricing calculation
        double rol = request.getTargetRate() != null && request.getTargetRate() > 0 ? request.getTargetRate() : calculateSyntheticROL(request);
        quote.setRateOnLine(rol);

        BigDecimal premium = quote.getSumInsured().multiply(BigDecimal.valueOf(rol)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        quote.setQuotedPremium(premium);

        double commission = request.getCedingCommission() != null ? request.getCedingCommission() : calculateDefaultCommission(request.getLineOfBusiness());
        quote.setCedingCommission(commission);

        quote.setStatus("QUOTED");
        quote.setCreatedAt(Instant.now());
        quote.setUpdatedAt(Instant.now());

        repository.saveQuote(quote);

        // Automatically structure synthetic risk exposure and layers
        RiskExposureEntity risk = createSyntheticRiskExposure(quote);
        repository.saveRisk(risk);

        return QuoteResponse.fromEntity(quote, risk.getLayers());
    }

    private double calculateSyntheticROL(QuoteRequest request) {
        String lob = request.getLineOfBusiness().toLowerCase();
        double baseRol;
        if (lob.contains("catastrophe") || lob.contains("property")) {
            baseRol = 3.75;
        } else if (lob.contains("cyber")) {
            baseRol = 4.20;
        } else if (lob.contains("marine") || lob.contains("energy")) {
            baseRol = 3.50;
        } else {
            baseRol = 3.25;
        }

        if ("STOP_LOSS".equalsIgnoreCase(request.getStructureType())) {
            baseRol *= 1.15;
        } else if ("QUOTA_SHARE".equalsIgnoreCase(request.getStructureType())) {
            baseRol *= 0.90;
        }
        return Math.round(baseRol * 100.0) / 100.0;
    }

    private double calculateDefaultCommission(String lineOfBusiness) {
        String lob = lineOfBusiness != null ? lineOfBusiness.toLowerCase() : "";
        if (lob.contains("quota")) {
            return 20.00;
        } else if (lob.contains("marine")) {
            return 17.50;
        } else if (lob.contains("casualty")) {
            return 15.00;
        }
        return 12.50;
    }

    private RiskExposureEntity createSyntheticRiskExposure(QuoteEntity quote) {
        RiskExposureEntity risk = new RiskExposureEntity();
        risk.setId(UUID.randomUUID());
        risk.setQuoteId(quote.getId());
        risk.setTotalExposure(quote.getSumInsured());

        BigDecimal pml = quote.getSumInsured().multiply(BigDecimal.valueOf(0.35)).setScale(2, RoundingMode.HALF_UP);
        risk.setProbableMaximumLoss(pml);
        risk.setCatRiskScore(38);
        risk.setUnderwritingDecision("PENDING");
        risk.setUnderwriterNotes("Synthetic quotation generated. Ready for underwriter exposure review.");

        List<LayerStructure> layers = new ArrayList<>();
        BigDecimal limit = quote.getSumInsured();
        BigDecimal att = quote.getAttachmentPoint() != null ? quote.getAttachmentPoint() : BigDecimal.ZERO;

        if ("EXCESS_OF_LOSS".equalsIgnoreCase(quote.getStructureType())) {
            BigDecimal layer1Limit = limit.multiply(BigDecimal.valueOf(0.4)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal layer2Limit = limit.subtract(layer1Limit);

            layers.add(new LayerStructure(1, att, layer1Limit, 100.00));
            layers.add(new LayerStructure(2, att.add(layer1Limit), layer2Limit, 50.00));
        } else {
            layers.add(new LayerStructure(1, att, limit, 60.00));
        }

        risk.setLayers(layers);
        return risk;
    }
}
