package com.citidirect.cashstatement.criteria;

import com.citidirect.cashstatement.criteria.dto.*;
import com.citidirect.cashstatement.criteria.model.BaseReport;
import com.citidirect.cashstatement.criteria.model.DerivedReport;
import com.citidirect.cashstatement.criteria.repository.DerivedReportRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DerivedReportService {

    private final DerivedReportRepository derivedReportRepository;
    private final ObjectMapper objectMapper;

    public DerivedReportService(DerivedReportRepository derivedReportRepository, ObjectMapper objectMapper) {
        this.derivedReportRepository = derivedReportRepository;
        this.objectMapper = objectMapper;
    }

    public List<BaseReport> getBaseReportsCatalog() {
        List<BaseReport> catalog = new ArrayList<>();
        catalog.add(new BaseReport("rep-001", "Account Statement – Comprehensive", "Cash Statements Reports", "All Reports", true));
        catalog.add(new BaseReport("rep-002", "Account Confirmation Certificate", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-003", "Account Statement Details – ASIA", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-004", "Account Statement Details Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-005", "Account Statement Details Report – Condensed", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-006", "Account Statement Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-007", "Account Status Certificate", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-008", "Intraday Transaction Activity Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-009", "End of Day Closing Ledger Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-010", "Cash Balances Summary Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-011", "Consolidated Balance Overview", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-012", "Historical Statement Archive Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-013", "Multi-Currency Cash Position Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-014", "Real-Time Gross Settlement Summary", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-015", "Treasury Liquidity Forecast Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-016", "Third-Party Bank Statement Summary", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-017", "Cheque Clearing and Deposit Activity", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-018", "SWIFT MT940 Cash Statement Extract", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-019", "SWIFT MT942 Intraday Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-020", "CAMT.053 XML Statement Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-021", "Cross-Border Wire Reconciliation Report", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-022", "Intercompany Cash Pooling Activity", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-023", "ZBA Zero Balance Sweeps Log", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-024", "Target Balancing Statement Summary", "Cash Statements Reports", "All Reports", false));
        catalog.add(new BaseReport("rep-025", "Interest and Account Service Charges", "Cash Statements Reports", "All Reports", false));
        return catalog;
    }

    public DefaultCriteriaResponse getDefaults() {
        return new DefaultCriteriaResponse();
    }

    @Transactional
    public DerivedReportResponse createDerivedReport(DerivedReportRequest request, String username) {
        DerivedReport entity = new DerivedReport();
        entity.setId(UUID.randomUUID().toString());
        entity.setDerivedReportName(request.getDerivedReportName());
        entity.setBaseReportName(request.getBaseReportName() != null ? request.getBaseReportName() : "Account Statement – Comprehensive");
        entity.setOwnerUsername(request.getDesignatedOwner() != null ? request.getDesignatedOwner() : username);
        entity.setFormat(request.getFormat());
        entity.setSharedPublic("PUBLIC".equalsIgnoreCase(request.getShare()));
        entity.setFavorite(request.isFavorite());
        entity.setDeliveryOptionId(request.getDeliveryOptionId());

        try {
            entity.setCriteriaPayload(objectMapper.writeValueAsString(request.getCriteria()));
        } catch (Exception e) {
            entity.setCriteriaPayload("{}");
        }

        entity.setCreatedAt(OffsetDateTime.now());
        entity.setUpdatedAt(OffsetDateTime.now());

        DerivedReport saved = derivedReportRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public DerivedReportResponse updateDerivedReport(String id, DerivedReportRequest request, String username) {
        DerivedReport entity = derivedReportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Derived report not found with id: " + id));

        entity.setDerivedReportName(request.getDerivedReportName());
        entity.setFormat(request.getFormat());
        entity.setSharedPublic("PUBLIC".equalsIgnoreCase(request.getShare()));
        entity.setFavorite(request.isFavorite());
        entity.setDeliveryOptionId(request.getDeliveryOptionId());

        try {
            entity.setCriteriaPayload(objectMapper.writeValueAsString(request.getCriteria()));
        } catch (Exception e) {
            // Keep existing
        }

        entity.setUpdatedAt(OffsetDateTime.now());
        DerivedReport saved = derivedReportRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public DerivedReportResponse getDerivedReport(String id) {
        DerivedReport entity = derivedReportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Derived report not found with id: " + id));
        return mapToResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<DerivedReportResponse> listDerivedReports(String username) {
        return derivedReportRepository.findByOwnerUsernameOrSharedPublicTrue(username).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDerivedReport(String id) {
        derivedReportRepository.deleteById(id);
    }

    public DerivedReportResponse mapToResponse(DerivedReport entity) {
        DerivedReportResponse response = new DerivedReportResponse();
        response.setId(entity.getId());
        response.setDerivedReportName(entity.getDerivedReportName());
        response.setBaseReportName(entity.getBaseReportName());
        response.setOwnerUsername(entity.getOwnerUsername());
        response.setFormat(entity.getFormat());
        response.setSharedPublic(entity.isSharedPublic());
        response.setFavorite(entity.isFavorite());
        response.setDeliveryOptionId(entity.getDeliveryOptionId());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        try {
            CriteriaPayload payload = objectMapper.readValue(entity.getCriteriaPayload(), CriteriaPayload.class);
            response.setCriteria(payload);
        } catch (Exception e) {
            response.setCriteria(new CriteriaPayload());
        }

        return response;
    }
}
