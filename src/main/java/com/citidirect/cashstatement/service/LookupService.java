package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.dto.LookupResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LookupService {

    public List<LookupResponse> getBranches(String query) {
        List<LookupResponse> branches = new ArrayList<>();
        LookupResponse b1 = new LookupResponse("BR-SG-001", "SG001", "Singapore Main Branch", "Marina Bay Financial Centre, Tower 1");
        LookupResponse b2 = new LookupResponse("BR-HK-002", "HK002", "Hong Kong Central Branch", "Two International Finance Centre, Central");
        LookupResponse b3 = new LookupResponse("BR-NY-003", "NY003", "New York Corporate Branch", "388 Greenwich Street, New York");
        LookupResponse b4 = new LookupResponse("BR-LDN-004", "LDN004", "London Canary Wharf Branch", "25 Canada Square, London");
        LookupResponse b5 = new LookupResponse("BR-TYO-005", "TYO005", "Tokyo Otemachi Branch", "Otemachi First Square, Tokyo");

        branches.add(b1);
        branches.add(b2);
        branches.add(b3);
        branches.add(b4);
        branches.add(b5);

        if (query != null && !query.trim().isEmpty()) {
            String q = query.toLowerCase();
            return branches.stream()
                    .filter(b -> b.getCode().toLowerCase().contains(q) || b.getName().toLowerCase().contains(q))
                    .collect(Collectors.toList());
        }
        return branches;
    }

    public List<LookupResponse> getCustomers(String query) {
        List<LookupResponse> customers = new ArrayList<>();
        LookupResponse c1 = new LookupResponse("CUST-99201", "CUST-99201", "Global Liquidity Corp APAC", "Multinational Treasury Conglomerate");
        LookupResponse c2 = new LookupResponse("CUST-88102", "CUST-88102", "Pacific Trade & Logistics Ltd", "Supply Chain and Regional Logistics");
        LookupResponse c3 = new LookupResponse("CUST-77403", "CUST-77403", "Apex Capital Management Ltd", "Hedge Fund & Alternative Investments");
        LookupResponse c4 = new LookupResponse("CUST-66204", "CUST-66204", "Vertex Energy Holdings Corp", "Commodities and Energy Trading");

        customers.add(c1);
        customers.add(c2);
        customers.add(c3);
        customers.add(c4);

        if (query != null && !query.trim().isEmpty()) {
            String q = query.toLowerCase();
            return customers.stream()
                    .filter(c -> c.getCode().toLowerCase().contains(q) || c.getName().toLowerCase().contains(q))
                    .collect(Collectors.toList());
        }
        return customers;
    }

    public List<LookupResponse> getAccounts(String branchCode, String customerId) {
        List<LookupResponse> accounts = new ArrayList<>();

        LookupResponse a1 = new LookupResponse("ACC-01", "8829102931", "APAC Operating DDA USD", "Corporate Operating Demand Deposit Account");
        a1.setCurrency("USD");
        a1.setBranchCode("SG001");
        a1.setCustomerId("CUST-99201");

        LookupResponse a2 = new LookupResponse("ACC-02", "8829102932", "HK Treasury DDA HKD", "Multi-Currency Pooling Account");
        a2.setCurrency("HKD");
        a2.setBranchCode("HK002");
        a2.setCustomerId("CUST-99201");

        LookupResponse a3 = new LookupResponse("ACC-03", "9930192840", "Global Payroll Account EUR", "Disbursement and Payroll Settlement");
        a3.setCurrency("EUR");
        a3.setBranchCode("LDN004");
        a3.setCustomerId("CUST-88102");

        LookupResponse a4 = new LookupResponse("ACC-04", "1102938475", "US Institutional Clearing USD", "Overnight Interest & Repo Account");
        a4.setCurrency("USD");
        a4.setBranchCode("NY003");
        a4.setCustomerId("CUST-77403");

        accounts.add(a1);
        accounts.add(a2);
        accounts.add(a3);
        accounts.add(a4);

        return accounts.stream()
                .filter(a -> (branchCode == null || branchCode.isEmpty() || a.getBranchCode().equalsIgnoreCase(branchCode)))
                .filter(a -> (customerId == null || customerId.isEmpty() || a.getCustomerId().equalsIgnoreCase(customerId)))
                .collect(Collectors.toList());
    }

    public List<LookupResponse> getReportNames(String query) {
        List<LookupResponse> templates = new ArrayList<>();

        LookupResponse t1 = new LookupResponse("REP-CASH-STMT-01", "CASH_STMT_COMP", "Account Statement - Comprehensive", "Standard full statement with all debits, credits, and ledger running balances.");
        t1.setCategory("Cash Management");
        t1.setModule("Reports & Analytics");

        LookupResponse t2 = new LookupResponse("REP-INTRADAY-02", "INTRADAY_POS", "Daily Intraday Cash Position", "Real-time intraday liquidity and provisional settlement report.");
        t2.setCategory("Liquidity & Treasury");
        t2.setModule("Reports & Analytics");

        LookupResponse t3 = new LookupResponse("REP-RECON-03", "GLOBAL_RECON", "Global Liquidity Reconciliation", "End-of-day multi-branch balance aggregation and variance reconciliation.");
        t3.setCategory("Reconciliation");
        t3.setModule("File Services");

        LookupResponse t4 = new LookupResponse("REP-FEE-04", "COMM_FEE_STMT", "Commercial Fee & Charges Summary", "Itemized breakdown of corporate transaction processing and wire fees.");
        t4.setCategory("Billing");
        t4.setModule("Self Service");

        templates.add(t1);
        templates.add(t2);
        templates.add(t3);
        templates.add(t4);

        if (query != null && !query.trim().isEmpty()) {
            String q = query.toLowerCase();
            return templates.stream()
                    .filter(t -> t.getName().toLowerCase().contains(q) || t.getDescription().toLowerCase().contains(q) || t.getCategory().toLowerCase().contains(q))
                    .collect(Collectors.toList());
        }
        return templates;
    }
}
