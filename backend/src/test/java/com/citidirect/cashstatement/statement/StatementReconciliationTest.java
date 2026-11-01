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
import com.citidirect.cashstatement.masterdata.repository.AppUserRepository;
import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class StatementReconciliationTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserEntitlementRepository entitlementRepository;

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private StatementAggregationService statementService;

    private Account testAccount;
    private Branch testBranch;
    private Customer testCustomer;
    private List<Transaction> testTransactions;

    @BeforeEach
    void setUp() {
        testBranch = new Branch("600", "LONDON MAIN BRANCH", "CITIGB2L", "GBR", true);
        testCustomer = new Customer("0000244654", "A CUSTOMER NAME", "GBR");
        testAccount = new Account(
                "XX12CITI11223344446677",
                "AN ACCOUNT NAME",
                "0000244654",
                "600",
                "GBP",
                "CHECKING",
                new BigDecimal("1074252.00"),
                new BigDecimal("1103501.82")
        );

        testTransactions = new ArrayList<>();

        LocalDate stmtDate = LocalDate.of(2022, 1, 22);

        Transaction t1 = new Transaction();
        t1.setId("txn-1");
        t1.setAccountNumber(testAccount.getAccountNumber());
        t1.setValueDate(stmtDate);
        t1.setStatementDate(stmtDate);
        t1.setDebitCredit("C");
        t1.setAmount(new BigDecimal("21020.67"));
        t1.setRunningBalance(new BigDecimal("1095272.67"));
        t1.setDescription("CUSTOMER PAYMENT INWARD");
        t1.setBankReference("CITI-FT-1001");
        t1.setTransactionCode("CITI001");
        t1.setOrderingPartyName("ALPHA TRADING LTD");
        testTransactions.add(t1);

        Transaction t2 = new Transaction();
        t2.setId("txn-2");
        t2.setAccountNumber(testAccount.getAccountNumber());
        t2.setValueDate(stmtDate);
        t2.setStatementDate(stmtDate);
        t2.setDebitCredit("C");
        t2.setAmount(new BigDecimal("43360.47"));
        t2.setRunningBalance(new BigDecimal("1138633.14"));
        t2.setDescription("SETTLEMENT CREDIT");
        t2.setBankReference("CITI-FT-1002");
        t2.setTransactionCode("CITI001");
        t2.setOrderingPartyName("BETA CAPITAL PARTNERS");
        testTransactions.add(t2);

        Transaction t3 = new Transaction();
        t3.setId("txn-3");
        t3.setAccountNumber(testAccount.getAccountNumber());
        t3.setValueDate(stmtDate);
        t3.setStatementDate(stmtDate);
        t3.setDebitCredit("C");
        t3.setAmount(new BigDecimal("217765.85"));
        t3.setRunningBalance(new BigDecimal("1356398.99"));
        t3.setDescription("SWIFT MT103 INTERCOMPANY TRANSFER");
        t3.setBankReference("CITI-FT-1003");
        t3.setTransactionCode("CITI002");
        t3.setOrderingPartyName("CITI CORP TREASURY NY");
        testTransactions.add(t3);

        Transaction t4 = new Transaction();
        t4.setId("txn-4");
        t4.setAccountNumber(testAccount.getAccountNumber());
        t4.setValueDate(stmtDate);
        t4.setStatementDate(stmtDate);
        t4.setDebitCredit("D");
        t4.setAmount(new BigDecimal("57311.86"));
        t4.setRunningBalance(new BigDecimal("1299087.13"));
        t4.setDescription("SUPPLIER OUTWARD WIRE");
        t4.setBankReference("CITI-FT-1004");
        t4.setTransactionCode("CITI003");
        t4.setBeneficiaryName("DELTA VENDOR SERVICES");
        testTransactions.add(t4);

        Transaction t5 = new Transaction();
        t5.setId("txn-5");
        t5.setAccountNumber(testAccount.getAccountNumber());
        t5.setValueDate(stmtDate);
        t5.setStatementDate(stmtDate);
        t5.setDebitCredit("D");
        t5.setAmount(new BigDecimal("234705.99"));
        t5.setRunningBalance(new BigDecimal("1064381.14"));
        t5.setDescription("TAX AND DIVIDEND REMITTANCE");
        t5.setBankReference("CITI-FT-1005");
        t5.setTransactionCode("CITI003");
        t5.setBeneficiaryName("HM REVENUE AND CUSTOMS");
        testTransactions.add(t5);

        Transaction t6 = new Transaction();
        t6.setId("txn-6");
        t6.setAccountNumber(testAccount.getAccountNumber());
        t6.setValueDate(stmtDate);
        t6.setStatementDate(stmtDate);
        t6.setDebitCredit("C");
        t6.setAmount(new BigDecimal("1437.63"));
        t6.setRunningBalance(new BigDecimal("1065818.77"));
        t6.setDescription("INTEREST REBATE");
        t6.setBankReference("CITI-FT-1006");
        t6.setTransactionCode("CITI004");
        t6.setOrderingPartyName("CITIBANK LONDON ASSET MGMT");
        testTransactions.add(t6);

        Transaction t7 = new Transaction();
        t7.setId("txn-7");
        t7.setAccountNumber(testAccount.getAccountNumber());
        t7.setValueDate(stmtDate);
        t7.setStatementDate(stmtDate);
        t7.setDebitCredit("C");
        t7.setAmount(new BigDecimal("37683.05"));
        t7.setRunningBalance(new BigDecimal("1103501.82"));
        t7.setDescription("DIRECT DEBIT RECEIVABLE");
        t7.setBankReference("CITI-FT-1007");
        t7.setTransactionCode("CITI001");
        t7.setOrderingPartyName("OMEGA ENTERPRISES");
        testTransactions.add(t7);
    }

    @Test
    @DisplayName("Verify Exact Section 4 Balance and Running Balance Reconciliation for Account XX12CITI11223344446677")
    void testReconciliationExactMath() {
        when(accountRepository.findById("XX12CITI11223344446677")).thenReturn(Optional.of(testAccount));
        when(branchRepository.findById("600")).thenReturn(Optional.of(testBranch));
        when(customerRepository.findById("0000244654")).thenReturn(Optional.of(testCustomer));
        when(transactionRepository.findByAccountNumberOrderByStatementDateAscCreatedAtAsc("XX12CITI11223344446677"))
                .thenReturn(testTransactions);

        CriteriaPayload criteria = new CriteriaPayload();
        criteria.setAccountNumber("XX12CITI11223344446677");
        criteria.setStatementDateRadio("NO_DATE_SELECTED");

        StatementReportData reportData = statementService.generateReportData("Account Statement – Comprehensive", criteria, "SYSTEM");

        assertNotNull(reportData);
        assertEquals(1, reportData.getAccounts().size());

        AccountSummaryData summary = reportData.getAccounts().get(0);
        assertEquals("XX12CITI11223344446677", summary.getAccountNumber());
        assertEquals("GBP", summary.getCurrency());
        assertEquals(new BigDecimal("1074252.00"), summary.getOpeningAvailableBalance());
        assertEquals(5, summary.getCreditCount());
        assertEquals(new BigDecimal("321267.67"), summary.getTotalCreditAmount());
        assertEquals(2, summary.getDebitCount());
        assertEquals(new BigDecimal("292017.85"), summary.getTotalDebitAmount());
        assertEquals(new BigDecimal("29249.82"), summary.getNetTransactionAmount());
        assertEquals(new BigDecimal("1103501.82"), summary.getClosingAvailableBalance());
        assertTrue(summary.isRunningBalanceEnabled());

        // Check each step of running balance
        assertEquals(new BigDecimal("1095272.67"), summary.getTransactions().get(0).getRunningBalance());
        assertEquals(new BigDecimal("1138633.14"), summary.getTransactions().get(1).getRunningBalance());
        assertEquals(new BigDecimal("1356398.99"), summary.getTransactions().get(2).getRunningBalance());
        assertEquals(new BigDecimal("1299087.13"), summary.getTransactions().get(3).getRunningBalance());
        assertEquals(new BigDecimal("1064381.14"), summary.getTransactions().get(4).getRunningBalance());
        assertEquals(new BigDecimal("1065818.77"), summary.getTransactions().get(5).getRunningBalance());
        assertEquals(new BigDecimal("1103501.82"), summary.getTransactions().get(6).getRunningBalance());
    }

    @Test
    @DisplayName("Filter by amount range retains authoritative period opening and closing balances")
    void testFilteredTransactionsPreservesAuthoritativeBalances() {
        when(accountRepository.findById("XX12CITI11223344446677")).thenReturn(Optional.of(testAccount));
        when(branchRepository.findById("600")).thenReturn(Optional.of(testBranch));
        when(customerRepository.findById("0000244654")).thenReturn(Optional.of(testCustomer));
        when(transactionRepository.findByAccountNumberOrderByStatementDateAscCreatedAtAsc("XX12CITI11223344446677"))
                .thenReturn(testTransactions);

        CriteriaPayload criteria = new CriteriaPayload();
        criteria.setAccountNumber("XX12CITI11223344446677");
        criteria.setAmountFrom(new BigDecimal("200000.00")); // Matches txn-3 (217,765.85) and txn-5 (234,705.99)
        criteria.setStatementDateRadio("NO_DATE_SELECTED");

        StatementReportData reportData = statementService.generateReportData("Account Statement – Comprehensive", criteria, "SYSTEM");

        assertNotNull(reportData);
        assertEquals(1, reportData.getAccounts().size());

        AccountSummaryData summary = reportData.getAccounts().get(0);
        // Only 2 filtered transactions displayed
        assertEquals(2, summary.getTransactions().size());
        // Opening and closing balances remain authoritative for the account
        assertEquals(new BigDecimal("1074252.00"), summary.getOpeningAvailableBalance());
        assertEquals(new BigDecimal("1103501.82"), summary.getClosingAvailableBalance());
        // Displayed transactions retain their true calculated running balance
        assertEquals(new BigDecimal("1356398.99"), summary.getTransactions().get(0).getRunningBalance());
        assertEquals(new BigDecimal("1064381.14"), summary.getTransactions().get(1).getRunningBalance());
    }

    @Test
    @DisplayName("Filter by Beneficiary / Ordering Party matches intended records")
    void testBeneficiaryFilter() {
        when(accountRepository.findById("XX12CITI11223344446677")).thenReturn(Optional.of(testAccount));
        when(branchRepository.findById("600")).thenReturn(Optional.of(testBranch));
        when(customerRepository.findById("0000244654")).thenReturn(Optional.of(testCustomer));
        when(transactionRepository.findByAccountNumberOrderByStatementDateAscCreatedAtAsc("XX12CITI11223344446677"))
                .thenReturn(testTransactions);

        CriteriaPayload criteria = new CriteriaPayload();
        criteria.setAccountNumber("XX12CITI11223344446677");
        criteria.setByOrderBeneficiary("DELTA VENDOR");
        criteria.setStatementDateRadio("NO_DATE_SELECTED");

        StatementReportData reportData = statementService.generateReportData("Account Statement – Comprehensive", criteria, "SYSTEM");

        AccountSummaryData summary = reportData.getAccounts().get(0);
        assertEquals(1, summary.getTransactions().size());
        assertEquals("CITI-FT-1004", summary.getTransactions().get(0).getBankReference());
    }
}
