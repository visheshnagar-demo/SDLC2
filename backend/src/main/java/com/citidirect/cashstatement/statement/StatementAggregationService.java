package com.citidirect.cashstatement.statement;

import com.citidirect.cashstatement.criteria.dto.CriteriaPayload;
import com.citidirect.cashstatement.masterdata.model.Account;
import com.citidirect.cashstatement.masterdata.model.Branch;
import com.citidirect.cashstatement.masterdata.model.Customer;
import com.citidirect.cashstatement.masterdata.model.Transaction;
import com.citidirect.cashstatement.masterdata.repository.AccountRepository;
import com.citidirect.cashstatement.masterdata.repository.BranchRepository;
import com.citidirect.cashstatement.masterdata.repository.CustomerRepository;
import com.citidirect.cashstatement.masterdata.repository.TransactionRepository;
import com.citidirect.cashstatement.masterdata.repository.UserEntitlementRepository;
import com.citidirect.cashstatement.masterdata.model.UserEntitlement;
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import com.citidirect.cashstatement.masterdata.model.AppUser;
import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.citidirect.cashstatement.statement.dto.TransactionRecord;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatementAggregationService {

    private final AccountRepository accountRepository;
    private final BranchRepository branchRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final UserEntitlementRepository entitlementRepository;
    private final AppUserRepository userRepository;

    public StatementAggregationService(AccountRepository accountRepository,
                                       BranchRepository branchRepository,
                                       CustomerRepository customerRepository,
                                       TransactionRepository transactionRepository,
                                       UserEntitlementRepository entitlementRepository,
                                       AppUserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.branchRepository = branchRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.entitlementRepository = entitlementRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public StatementReportData generateReportData(String reportName, CriteriaPayload criteria, String username) {
        StatementReportData reportData = new StatementReportData();
        reportData.setReportName(reportName != null ? reportName : "Account Statement – Comprehensive");
        reportData.setCriteria(criteria != null ? criteria : new CriteriaPayload());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(
                criteria != null && StringUtils.hasText(criteria.getDateFormat()) ? criteria.getDateFormat() : "MM/dd/yyyy"
        );
        reportData.setReportDate(LocalDate.now().format(formatter));

        // 1. Resolve User Entitlements
        List<String> entitledAccounts = resolveUserEntitledAccounts(username);

        // 2. Resolve Target Accounts ensuring strict entitlement enforcement
        List<Account> targetAccounts = resolveTargetAccounts(criteria, entitledAccounts);

        // 3. Resolve Date Ranges
        DateRange statementRange = resolveDateRange(
                criteria != null ? criteria.getStatementDateRadio() : "NO_DATE_SELECTED",
                criteria != null ? criteria.getStatementDateFrom() : null,
                criteria != null ? criteria.getStatementDateTo() : null
        );

        DateRange valueRange = resolveDateRange(
                criteria != null ? criteria.getValueDateRadio() : "NO_DATE_SELECTED",
                criteria != null ? criteria.getValueDateFrom() : null,
                criteria != null ? criteria.getValueDateTo() : null
        );

        List<AccountSummaryData> accountSummaries = new ArrayList<>();

        for (Account account : targetAccounts) {
            // Apply Account Currency filter if specified
            if (criteria != null && StringUtils.hasText(criteria.getAccountCurrency())
                    && !criteria.getAccountCurrency().equalsIgnoreCase(account.getCurrency())) {
                continue;
            }

            Branch branch = branchRepository.findById(account.getBranchNumber())
                    .orElseGet(() -> new Branch(account.getBranchNumber(), "BRANCH " + account.getBranchNumber(), "CITIXXXX", "GBR", true));
            Customer customer = customerRepository.findById(account.getCustomerNumber())
                    .orElseGet(() -> new Customer(account.getCustomerNumber(), "CUSTOMER " + account.getCustomerNumber(), "GBR"));

            List<Transaction> allAccountTxns = transactionRepository.findByAccountNumberOrderByStatementDateAscCreatedAtAsc(account.getAccountNumber());

            // Compute authoritative baseline balances across statement period
            BigDecimal openingBalance = account.getOpeningBalance();
            if (statementRange.hasFilter() && statementRange.getStartDate() != null) {
                // Adjust opening balance by transactions prior to statement range
                BigDecimal prePeriodNet = BigDecimal.ZERO;
                for (Transaction t : allAccountTxns) {
                    if (t.getStatementDate().isBefore(statementRange.getStartDate())) {
                        if ("C".equalsIgnoreCase(t.getDebitCredit())) {
                            prePeriodNet = prePeriodNet.add(t.getAmount());
                        } else {
                            prePeriodNet = prePeriodNet.subtract(t.getAmount());
                        }
                    }
                }
                openingBalance = openingBalance.add(prePeriodNet);
            }

            // Identify statement period transactions
            List<Transaction> periodTxns = allAccountTxns;
            if (statementRange.hasFilter()) {
                periodTxns = allAccountTxns.stream()
                        .filter(t -> statementRange.matches(t.getStatementDate()))
                        .collect(Collectors.toList());
            }

            // Calculate authoritative running balances and statement period totals
            int periodCreditCount = 0;
            BigDecimal periodTotalCredit = BigDecimal.ZERO;
            int periodDebitCount = 0;
            BigDecimal periodTotalDebit = BigDecimal.ZERO;
            BigDecimal currentRunning = openingBalance;

            Map<String, BigDecimal> calculatedRunningBalances = new HashMap<>();

            for (Transaction t : periodTxns) {
                if ("C".equalsIgnoreCase(t.getDebitCredit())) {
                    periodCreditCount++;
                    periodTotalCredit = periodTotalCredit.add(t.getAmount());
                    currentRunning = currentRunning.add(t.getAmount());
                } else {
                    periodDebitCount++;
                    periodTotalDebit = periodTotalDebit.add(t.getAmount());
                    currentRunning = currentRunning.subtract(t.getAmount());
                }
                calculatedRunningBalances.put(t.getId(), currentRunning);
            }

            BigDecimal closingBalance = currentRunning;

            // Apply Value Date Filter to transactions
            List<Transaction> filteredTxns = periodTxns;
            if (valueRange.hasFilter()) {
                filteredTxns = filteredTxns.stream()
                        .filter(t -> valueRange.matches(t.getValueDate()))
                        .collect(Collectors.toList());
            }

            // Apply Criteria Filters (amount, reference, description, beneficiary, transaction code, cheques)
            if (criteria != null) {
                filteredTxns = filterTransactionsByCriteria(filteredTxns, criteria);
            }

            // Activity Only filter check: skip account if no matching transaction activity
            if (criteria != null && criteria.isActivityOnly() && filteredTxns.isEmpty()) {
                continue;
            }

            AccountSummaryData summary = new AccountSummaryData();
            summary.setCustomerNumber(customer.getCustomerNumber());
            summary.setCustomerName(customer.getCustomerName());
            summary.setBranchNumber(branch.getBranchNumber());
            summary.setBranchName(branch.getBranchName());
            summary.setSwiftCode(branch.getSwiftCode());
            summary.setAccountNumber(account.getAccountNumber());
            summary.setAccountName(account.getAccountName());
            summary.setCurrency(account.getCurrency());
            summary.setAccountType(account.getAccountType());
            summary.setRunningBalanceEnabled(branch.isRunningBalanceEnabled());

            LocalDate displayStatementDate = statementRange.getStartDate() != null ? statementRange.getStartDate() : LocalDate.now();
            summary.setStatementDate(displayStatementDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

            // Calculate summary counts and amounts from filtered transactions
            int filteredCreditCount = 0;
            BigDecimal filteredTotalCredit = BigDecimal.ZERO;
            int filteredDebitCount = 0;
            BigDecimal filteredTotalDebit = BigDecimal.ZERO;

            for (Transaction t : filteredTxns) {
                if ("C".equalsIgnoreCase(t.getDebitCredit())) {
                    filteredCreditCount++;
                    filteredTotalCredit = filteredTotalCredit.add(t.getAmount());
                } else {
                    filteredDebitCount++;
                    filteredTotalDebit = filteredTotalDebit.add(t.getAmount());
                }
            }

            summary.setOpeningAvailableBalance(openingBalance);
            summary.setClosingAvailableBalance(closingBalance);
            summary.setIntradayBalance(account.getCurrentBalance() != null ? account.getCurrentBalance() : closingBalance);
            summary.setIntradayAvailableBalance(account.getCurrentBalance() != null ? account.getCurrentBalance() : closingBalance);
            summary.setCreditCount(filteredCreditCount);
            summary.setTotalCreditAmount(filteredTotalCredit);
            summary.setDebitCount(filteredDebitCount);
            summary.setTotalDebitAmount(filteredTotalDebit);
            summary.setNetTransactionAmount(filteredTotalCredit.subtract(filteredTotalDebit));

            List<TransactionRecord> records = new ArrayList<>();
            for (Transaction t : filteredTxns) {
                TransactionRecord r = mapToRecord(t);
                BigDecimal runBal = calculatedRunningBalances.getOrDefault(t.getId(), t.getRunningBalance());
                r.setRunningBalance(runBal);
                records.add(r);
            }
            summary.setTransactions(records);

            accountSummaries.add(summary);
        }

        reportData.setAccounts(accountSummaries);

        // Calculate Grand Totals across all included accounts
        BigDecimal grandOpening = BigDecimal.ZERO;
        BigDecimal grandClosing = BigDecimal.ZERO;
        int grandCreditCount = 0;
        BigDecimal grandCreditAmt = BigDecimal.ZERO;
        int grandDebitCount = 0;
        BigDecimal grandDebitAmt = BigDecimal.ZERO;

        for (AccountSummaryData acc : accountSummaries) {
            grandOpening = grandOpening.add(acc.getOpeningAvailableBalance());
            grandClosing = grandClosing.add(acc.getClosingAvailableBalance());
            grandCreditCount += acc.getCreditCount();
            grandCreditAmt = grandCreditAmt.add(acc.getTotalCreditAmount());
            grandDebitCount += acc.getDebitCount();
            grandDebitAmt = grandDebitAmt.add(acc.getTotalDebitAmount());
        }

        reportData.setGrandOpeningBalance(grandOpening);
        reportData.setGrandClosingBalance(grandClosing);
        reportData.setGrandCreditCount(grandCreditCount);
        reportData.setGrandTotalCreditAmount(grandCreditAmt);
        reportData.setGrandDebitCount(grandDebitCount);
        reportData.setGrandTotalDebitAmount(grandDebitAmt);
        reportData.setGrandNetTransactionAmount(grandCreditAmt.subtract(grandDebitAmt));

        return reportData;
    }

    private List<String> resolveUserEntitledAccounts(String username) {
        if (!StringUtils.hasText(username) || "SYSTEM".equalsIgnoreCase(username)) {
            // For system or internal test context without user constraint, return all accounts
            return accountRepository.findAll().stream().map(Account::getAccountNumber).collect(Collectors.toList());
        }

        Optional<AppUser> userOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username));

        if (userOpt.isEmpty()) {
            return Collections.emptyList();
        }

        AppUser user = userOpt.get();
        List<UserEntitlement> entitlements = entitlementRepository.findByUserId(user.getId());
        return entitlements.stream()
                .filter(e -> "ACCOUNT".equalsIgnoreCase(e.getEntityType()))
                .map(UserEntitlement::getEntityId)
                .collect(Collectors.toList());
    }

    private List<Account> resolveTargetAccounts(CriteriaPayload criteria, List<String> entitledAccounts) {
        if (entitledAccounts == null || entitledAccounts.isEmpty()) {
            return Collections.emptyList();
        }

        if (criteria == null) {
            return accountRepository.findAll().stream()
                    .filter(a -> entitledAccounts.contains(a.getAccountNumber()))
                    .collect(Collectors.toList());
        }

        boolean isAccountGroup = "ACCOUNT_GROUP".equalsIgnoreCase(criteria.getAccountSelectionType())
                || StringUtils.hasText(criteria.getAccountGroup());

        if (isAccountGroup) {
            String group = criteria.getAccountGroup();
            List<Account> candidateAccounts;
            if (StringUtils.hasText(criteria.getCustomerNumber()) && StringUtils.hasText(criteria.getBranchNumber())) {
                candidateAccounts = accountRepository.findByCustomerNumberAndBranchNumber(criteria.getCustomerNumber(), criteria.getBranchNumber());
            } else if (StringUtils.hasText(criteria.getCustomerNumber())) {
                candidateAccounts = accountRepository.findByCustomerNumber(criteria.getCustomerNumber());
            } else if (StringUtils.hasText(criteria.getBranchNumber())) {
                candidateAccounts = accountRepository.findByBranchNumber(criteria.getBranchNumber());
            } else {
                candidateAccounts = accountRepository.findAll();
            }

            return candidateAccounts.stream()
                    .filter(a -> entitledAccounts.contains(a.getAccountNumber()))
                    .filter(a -> {
                        if (!StringUtils.hasText(group) || "ALL".equalsIgnoreCase(group.trim())) {
                            return true;
                        }
                        String g = group.trim().toLowerCase();
                        return (a.getAccountType() != null && a.getAccountType().toLowerCase().contains(g))
                                || (a.getCurrency() != null && a.getCurrency().equalsIgnoreCase(g))
                                || (a.getAccountName() != null && a.getAccountName().toLowerCase().contains(g))
                                || (a.getAccountNumber() != null && a.getAccountNumber().toLowerCase().contains(g));
                    })
                    .collect(Collectors.toList());
        }

        if (StringUtils.hasText(criteria.getAccountNumber())) {
            String requestedAcc = criteria.getAccountNumber().trim();
            if (!entitledAccounts.contains(requestedAcc)) {
                throw new AccessDeniedException("User is not authorized to access account: " + requestedAcc);
            }
            return accountRepository.findById(requestedAcc)
                    .map(List::of)
                    .orElse(Collections.emptyList());
        }

        List<Account> matches;
        if (StringUtils.hasText(criteria.getCustomerNumber()) && StringUtils.hasText(criteria.getBranchNumber())) {
            matches = accountRepository.findByCustomerNumberAndBranchNumber(criteria.getCustomerNumber(), criteria.getBranchNumber());
        } else if (StringUtils.hasText(criteria.getCustomerNumber())) {
            matches = accountRepository.findByCustomerNumber(criteria.getCustomerNumber());
        } else if (StringUtils.hasText(criteria.getBranchNumber())) {
            matches = accountRepository.findByBranchNumber(criteria.getBranchNumber());
        } else {
            matches = accountRepository.findAll();
        }

        return matches.stream()
                .filter(a -> entitledAccounts.contains(a.getAccountNumber()))
                .collect(Collectors.toList());
    }

    private List<Transaction> filterTransactionsByCriteria(List<Transaction> list, CriteriaPayload criteria) {
        return list.stream().filter(t -> {
            if (StringUtils.hasText(criteria.getBankReference())) {
                if (!matchString(t.getBankReference(), criteria.getBankReference(), criteria.getBankReferenceOperator())) {
                    return false;
                }
            }
            if (StringUtils.hasText(criteria.getCustomerReference())) {
                if (!matchString(t.getCustomerReference(), criteria.getCustomerReference(), criteria.getCustomerReferenceOperator())) {
                    return false;
                }
            }
            if (criteria.getAmountFrom() != null && t.getAmount().compareTo(criteria.getAmountFrom()) < 0) {
                return false;
            }
            if (criteria.getAmountTo() != null && t.getAmount().compareTo(criteria.getAmountTo()) > 0) {
                return false;
            }
            if (StringUtils.hasText(criteria.getTransactionDescription())) {
                if (!matchString(t.getDescription(), criteria.getTransactionDescription(), criteria.getTransactionDescriptionOperator())) {
                    return false;
                }
            }
            if (StringUtils.hasText(criteria.getByOrderBeneficiary())) {
                String search = criteria.getByOrderBeneficiary().toLowerCase();
                boolean matchesParty = (t.getOrderingPartyName() != null && t.getOrderingPartyName().toLowerCase().contains(search))
                        || (t.getBeneficiaryName() != null && t.getBeneficiaryName().toLowerCase().contains(search))
                        || (t.getOrderingPartyAccount() != null && t.getOrderingPartyAccount().toLowerCase().contains(search))
                        || (t.getBeneficiaryAccount() != null && t.getBeneficiaryAccount().toLowerCase().contains(search));
                if (!matchesParty) {
                    return false;
                }
            }
            if (StringUtils.hasText(criteria.getTransactionCode())
                    && !"Citi Transaction Codes".equalsIgnoreCase(criteria.getTransactionCode())
                    && !"All".equalsIgnoreCase(criteria.getTransactionCode())) {
                if (!criteria.getTransactionCode().equalsIgnoreCase(t.getTransactionCode())) {
                    return false;
                }
            }
            if (StringUtils.hasText(criteria.getCheques())) {
                String chq = criteria.getCheques().trim();
                boolean hasChequeNum = t.getChequeNumber() != null && !t.getChequeNumber().trim().isEmpty();
                if ("Cheques Only".equalsIgnoreCase(chq) && !hasChequeNum) {
                    return false;
                }
                if ("Exclude Cheques".equalsIgnoreCase(chq) && hasChequeNum) {
                    return false;
                }
            }
            return true;
        }).collect(Collectors.toList());
    }

    private boolean matchString(String source, String target, String operator) {
        if (source == null || target == null) return false;
        String s = source.toLowerCase();
        String t = target.toLowerCase();
        if ("CONTAINS".equalsIgnoreCase(operator)) {
            return s.contains(t);
        } else if ("STARTS_WITH".equalsIgnoreCase(operator)) {
            return s.startsWith(t);
        } else {
            return s.equals(t);
        }
    }

    private TransactionRecord mapToRecord(Transaction t) {
        TransactionRecord r = new TransactionRecord();
        r.setId(t.getId());
        r.setAccountNumber(t.getAccountNumber());
        r.setValueDate(t.getValueDate());
        r.setStatementDate(t.getStatementDate());
        r.setCustomerReference(t.getCustomerReference());
        r.setBankReference(t.getBankReference());
        r.setDescription(t.getDescription());
        r.setDebitCredit(t.getDebitCredit());
        r.setAmount(t.getAmount());
        r.setRunningBalance(t.getRunningBalance());
        r.setOrderingPartyName(t.getOrderingPartyName());
        r.setOrderingPartyAccount(t.getOrderingPartyAccount());
        r.setOrderingPartyAddress1(t.getOrderingPartyAddress1());
        r.setOrderingPartyAddress2(t.getOrderingPartyAddress2());
        r.setOrderingBank(t.getOrderingBank());
        r.setBeneficiaryName(t.getBeneficiaryName());
        r.setBeneficiaryAccount(t.getBeneficiaryAccount());
        r.setBeneficiaryBank(t.getBeneficiaryBank());
        r.setRemittanceInformation(t.getRemittanceInformation());
        r.setTransactionCode(t.getTransactionCode());
        r.setProductType(t.getProductType());
        r.setBatchNumber(t.getBatchNumber());
        r.setEnhancedDetails(t.getEnhancedDetails());
        return r;
    }

    private DateRange resolveDateRange(String radio, LocalDate from, LocalDate to) {
        if (radio == null || "NO_DATE_SELECTED".equalsIgnoreCase(radio)) {
            return new DateRange(null, null, false);
        }
        LocalDate now = LocalDate.now();
        switch (radio.toUpperCase()) {
            case "TODAY":
                return new DateRange(now, now, true);
            case "YESTERDAY":
                LocalDate yest = now.minusDays(1);
                return new DateRange(yest, yest, true);
            case "LAST_7_DAYS":
                return new DateRange(now.minusDays(7), now, true);
            case "LAST_14_DAYS":
                return new DateRange(now.minusDays(14), now, true);
            case "LAST_30_DAYS":
                return new DateRange(now.minusDays(30), now, true);
            case "CURRENT_MONTH":
                return new DateRange(now.withDayOfMonth(1), now, true);
            case "PREVIOUS_MONTH":
                LocalDate prevMonth = now.minusMonths(1);
                return new DateRange(prevMonth.withDayOfMonth(1), prevMonth.withDayOfMonth(prevMonth.lengthOfMonth()), true);
            case "DATE_RANGE":
                return new DateRange(from, to, from != null || to != null);
            case "LATEST":
            default:
                return new DateRange(null, null, false);
        }
    }

    public static class DateRange {
        private final LocalDate startDate;
        private final LocalDate endDate;
        private final boolean filter;

        public DateRange(LocalDate startDate, LocalDate endDate, boolean filter) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.filter = filter;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public boolean hasFilter() {
            return filter && (startDate != null || endDate != null);
        }

        public boolean matches(LocalDate date) {
            if (date == null) return false;
            if (startDate != null && date.isBefore(startDate)) return false;
            if (endDate != null && date.isAfter(endDate)) return false;
            return true;
        }
    }
}
