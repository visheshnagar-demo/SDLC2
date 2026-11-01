package com.citidirect.cashstatement.masterdata;

import com.citidirect.cashstatement.masterdata.model.Account;
import com.citidirect.cashstatement.masterdata.model.AppUser;
import com.citidirect.cashstatement.masterdata.model.Branch;
import com.citidirect.cashstatement.masterdata.model.Customer;
import com.citidirect.cashstatement.masterdata.repository.AccountRepository;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import com.citidirect.cashstatement.masterdata.repository.BranchRepository;
import com.citidirect.cashstatement.masterdata.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/lookups")
public class LookupController {

    private final BranchRepository branchRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final AppUserRepository userRepository;

    public LookupController(BranchRepository branchRepository,
                            CustomerRepository customerRepository,
                            AccountRepository accountRepository,
                            AppUserRepository userRepository) {
        this.branchRepository = branchRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/branches")
    public ResponseEntity<List<Branch>> getBranches(@RequestParam(required = false) String query) {
        List<Branch> branches;
        if (StringUtils.hasText(query)) {
            branches = branchRepository.searchBranches(query);
        } else {
            branches = branchRepository.findAll();
        }
        return ResponseEntity.ok(branches);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getCustomers(@RequestParam(required = false) String query) {
        List<Customer> customers;
        if (StringUtils.hasText(query)) {
            customers = customerRepository.searchCustomers(query);
        } else {
            customers = customerRepository.findAll();
        }
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAccounts(
            @RequestParam(required = false) String customerNumber,
            @RequestParam(required = false) String branchNumber,
            @RequestParam(required = false) String query) {
        List<Account> accounts;
        if (StringUtils.hasText(customerNumber) && StringUtils.hasText(branchNumber)) {
            accounts = accountRepository.findByCustomerNumberAndBranchNumber(customerNumber, branchNumber);
        } else if (StringUtils.hasText(customerNumber)) {
            accounts = accountRepository.findByCustomerNumber(customerNumber);
        } else if (StringUtils.hasText(branchNumber)) {
            accounts = accountRepository.findByBranchNumber(branchNumber);
        } else if (StringUtils.hasText(query)) {
            accounts = accountRepository.searchAccounts(query);
        } else {
            accounts = accountRepository.findAll();
        }
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/currencies")
    public ResponseEntity<List<Map<String, String>>> getCurrencies() {
        List<Map<String, String>> currencies = List.of(
                Map.of("code", "USD", "name", "US Dollar"),
                Map.of("code", "GBP", "name", "British Pound Sterling"),
                Map.of("code", "EUR", "name", "Euro"),
                Map.of("code", "SGD", "name", "Singapore Dollar"),
                Map.of("code", "HKD", "name", "Hong Kong Dollar"),
                Map.of("code", "JPY", "name", "Japanese Yen"),
                Map.of("code", "CHF", "name", "Swiss Franc"),
                Map.of("code", "AUD", "name", "Australian Dollar"),
                Map.of("code", "CAD", "name", "Canadian Dollar")
        );
        return ResponseEntity.ok(currencies);
    }

    @GetMapping("/transaction-descriptions")
    public ResponseEntity<List<Map<String, String>>> getTransactionDescriptions() {
        List<Map<String, String>> descriptions = List.of(
                Map.of("code", "DESC_001", "description", "CUSTOMER PAYMENT INWARD"),
                Map.of("code", "DESC_002", "description", "SETTLEMENT CREDIT"),
                Map.of("code", "DESC_003", "description", "SWIFT MT103 INTERCOMPANY TRANSFER"),
                Map.of("code", "DESC_004", "description", "SUPPLIER OUTWARD WIRE"),
                Map.of("code", "DESC_005", "description", "TAX AND DIVIDEND REMITTANCE"),
                Map.of("code", "DESC_006", "description", "INTEREST REBATE"),
                Map.of("code", "DESC_007", "description", "DIRECT DEBIT RECEIVABLE")
        );
        return ResponseEntity.ok(descriptions);
    }

    @GetMapping("/owners")
    public ResponseEntity<List<Map<String, String>>> getOwners() {
        List<AppUser> users = userRepository.findAll();
        List<Map<String, String>> owners = users.stream()
                .map(u -> Map.of("username", u.getUsername(), "fullName", u.getFullName(), "email", u.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(owners);
    }

    @GetMapping("/transaction-codes")
    public ResponseEntity<List<String>> getTransactionCodes() {
        return ResponseEntity.ok(List.of(
                "Citi Transaction Codes",
                "SWIFT Transaction Codes",
                "ISO 20022 Domain Codes",
                "Local Clearing Codes"
        ));
    }
}
