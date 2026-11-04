package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.LookupDTO;
import com.citidirect.cashstatement.entity.BaseReport;
import com.citidirect.cashstatement.repository.BaseReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LookupService {

    private final BaseReportRepository baseReportRepository;

    public LookupService(BaseReportRepository baseReportRepository) {
        this.baseReportRepository = baseReportRepository;
    }

    public List<LookupDTO.BranchLookup> getBranches() {
        return List.of(
            new LookupDTO.BranchLookup("BR-NYC-001", "New York Main Financial Center"),
            new LookupDTO.BranchLookup("BR-LON-002", "London Canary Wharf Treasury Hub"),
            new LookupDTO.BranchLookup("BR-SIN-003", "Singapore Marina Bay Regional Branch"),
            new LookupDTO.BranchLookup("BR-HKG-004", "Hong Kong Central Operations Hub"),
            new LookupDTO.BranchLookup("BR-TYO-005", "Tokyo Otemachi Banking Center"),
            new LookupDTO.BranchLookup("BR-FRA-006", "Frankfurt European Clearing Branch")
        );
    }

    public List<LookupDTO.CustomerLookup> getCustomers() {
        return List.of(
            new LookupDTO.CustomerLookup("CUST-9021", "Global Logistics Corp & Subsidiaries"),
            new LookupDTO.CustomerLookup("CUST-9022", "Apex Semiconductor International Ltd"),
            new LookupDTO.CustomerLookup("CUST-9023", "Meridian Energy & Infrastructure Group"),
            new LookupDTO.CustomerLookup("CUST-9024", "Centennial Pharmaceuticals USA Inc"),
            new LookupDTO.CustomerLookup("CUST-9025", "Vanguard Automotive Solutions LLC")
        );
    }

    public List<LookupDTO.AccountLookup> getAccounts() {
        return List.of(
            new LookupDTO.AccountLookup("ACC-100234", "USD", "BR-NYC-001", new BigDecimal("4500210.50")),
            new LookupDTO.AccountLookup("ACC-100567", "USD", "BR-NYC-001", new BigDecimal("1250340.25")),
            new LookupDTO.AccountLookup("ACC-200891", "EUR", "BR-FRA-006", new BigDecimal("8920150.00")),
            new LookupDTO.AccountLookup("ACC-300412", "GBP", "BR-LON-002", new BigDecimal("3410500.80")),
            new LookupDTO.AccountLookup("ACC-400789", "SGD", "BR-SIN-003", new BigDecimal("6750000.00")),
            new LookupDTO.AccountLookup("ACC-500123", "JPY", "BR-TYO-005", new BigDecimal("154200000.00"))
        );
    }

    @Transactional(readOnly = true)
    public List<LookupDTO.ReportNameLookup> getReportNames() {
        List<BaseReport> baseReports = baseReportRepository.findByIsActiveTrue();
        return baseReports.stream()
            .map(r -> new LookupDTO.ReportNameLookup(r.getId(), r.getReportCode(), r.getName(), r.getCategory()))
            .collect(Collectors.toList());
    }
}
