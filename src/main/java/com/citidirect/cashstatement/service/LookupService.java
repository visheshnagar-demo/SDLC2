package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.LookupAccountDTO;
import com.citidirect.cashstatement.dto.LookupBranchDTO;
import com.citidirect.cashstatement.dto.LookupCustomerDTO;
import com.citidirect.cashstatement.entity.BaseReport;
import com.citidirect.cashstatement.repository.BaseReportRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
public class LookupService {

    private final BaseReportRepository baseReportRepository;

    public LookupService(BaseReportRepository baseReportRepository) {
        this.baseReportRepository = baseReportRepository;
    }

    public List<BaseReport> getReportNames() {
        return baseReportRepository.findAll();
    }

    public List<LookupBranchDTO> getBranches() {
        return Arrays.asList(
            new LookupBranchDTO("NYC-001", "New York Main Branch", "New York", "USA"),
            new LookupBranchDTO("LON-044", "London Canary Wharf", "London", "GBR"),
            new LookupBranchDTO("SIN-012", "Singapore Marina Bay", "Singapore", "SGP"),
            new LookupBranchDTO("FRA-009", "Frankfurt Main Desk", "Frankfurt", "DEU"),
            new LookupBranchDTO("HKG-002", "Hong Kong Central", "Hong Kong", "HKG"),
            new LookupBranchDTO("ZRH-005", "Zurich Paradeplatz", "Zurich", "CHE")
        );
    }

    public List<LookupCustomerDTO> getCustomers() {
        return Arrays.asList(
            new LookupCustomerDTO("CUST-9021", "Global Logistics Corp", "US-88291039"),
            new LookupCustomerDTO("CUST-9022", "Apex Energy International", "GB-77192044"),
            new LookupCustomerDTO("CUST-9023", "Pacific Maritime Holdings", "SG-99381022"),
            new LookupCustomerDTO("CUST-9024", "Continental Manufacturing GMBH", "DE-11029481")
        );
    }

    public List<LookupAccountDTO> getAccounts() {
        return Arrays.asList(
            new LookupAccountDTO("CITI-US-99201488", "USD Main Operational", "USD", "NYC-001", new BigDecimal("48520300.50")),
            new LookupAccountDTO("CITI-GB-88402199", "GBP Treasury Clearing", "GBP", "LON-044", new BigDecimal("14209110.20")),
            new LookupAccountDTO("CITI-SG-44109833", "SGD Regional Sweeping", "SGD", "SIN-012", new BigDecimal("32910400.00")),
            new LookupAccountDTO("CITI-DE-11029481", "EUR Pooling Account", "EUR", "FRA-009", new BigDecimal("88190200.75")),
            new LookupAccountDTO("CITI-HK-55209118", "HKD Multi-Currency Desk", "HKD", "HKG-002", new BigDecimal("195004000.00")),
            new LookupAccountDTO("CITI-US-33991204", "USD ZBA Sweep Pool", "USD", "NYC-001", new BigDecimal("9140000.00")),
            new LookupAccountDTO("CITI-US-77884100", "USD Escrow & Segregated Funds", "USD", "NYC-001", new BigDecimal("125000000.00")),
            new LookupAccountDTO("CITI-CH-66104882", "CHF Liquidity Buffer", "CHF", "ZRH-005", new BigDecimal("22400100.00"))
        );
    }
}
