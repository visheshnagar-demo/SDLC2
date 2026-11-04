package com.citi.cashstatement.service;

import com.citi.cashstatement.dto.StatementGenerateRequest;
import com.citi.cashstatement.dto.StatementGenerateResponse;
import com.citi.cashstatement.entity.Account;
import com.citi.cashstatement.entity.Transaction;
import com.citi.cashstatement.repository.AccountRepository;
import com.citi.cashstatement.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CashStatementService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLoggerService auditLoggerService;

    public CashStatementService(AccountRepository accountRepository,
                                TransactionRepository transactionRepository,
                                AuditLoggerService auditLoggerService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.auditLoggerService = auditLoggerService;
    }

    public StatementGenerateResponse generateStatement(StatementGenerateRequest request, String userId) {
        List<String> accountNumbers = request.getAccountNumbers();
        if (accountNumbers == null || accountNumbers.isEmpty()) {
            List<Account> allAccounts = accountRepository.findByIsActiveTrue();
            accountNumbers = allAccounts.stream().map(Account::getAccountNumber).collect(Collectors.toList());
        }

        OffsetDateTime dateFrom = request.getDateFrom() != null ? request.getDateFrom() : OffsetDateTime.now().minusDays(30);
        OffsetDateTime dateTo = request.getDateTo() != null ? request.getDateTo() : OffsetDateTime.now();

        int pageNum = request.getPage() != null ? request.getPage() : 0;
        int pageSize = request.getSize() != null ? request.getSize() : 50;
        Pageable pageable = PageRequest.of(pageNum, pageSize);

        if (accountNumbers.isEmpty()) {
            return StatementGenerateResponse.builder()
                    .statementId("stmt_" + UUID.randomUUID().toString().substring(0, 8))
                    .entityName(request.getEntityId() != null ? request.getEntityId() : "Citigroup NA Treasury")
                    .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                    .openingBalance(BigDecimal.ZERO)
                    .closingBalance(BigDecimal.ZERO)
                    .totalDebits(BigDecimal.ZERO)
                    .totalCredits(BigDecimal.ZERO)
                    .totalRecords(0L)
                    .records(Collections.emptyList())
                    .build();
        }

        Page<Transaction> txPage = transactionRepository.findFilteredTransactions(
                accountNumbers,
                request.getCurrency(),
                request.getEntityId(),
                dateFrom,
                dateTo,
                pageable
        );

        List<Transaction> allMatching = transactionRepository.findFilteredTransactionsList(
                accountNumbers,
                request.getCurrency(),
                request.getEntityId(),
                dateFrom,
                dateTo
        );

        BigDecimal totalCredits = BigDecimal.ZERO;
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal openingBalance = BigDecimal.ZERO;
        BigDecimal closingBalance = BigDecimal.ZERO;

        if (!allMatching.isEmpty()) {
            Transaction firstTx = allMatching.get(0);
            Transaction lastTx = allMatching.get(allMatching.size() - 1);

            if ("CREDIT".equalsIgnoreCase(firstTx.getTransactionType())) {
                openingBalance = firstTx.getRunningBalance().subtract(firstTx.getAmount());
            } else {
                openingBalance = firstTx.getRunningBalance().add(firstTx.getAmount());
            }
            closingBalance = lastTx.getRunningBalance();

            for (Transaction tx : allMatching) {
                if ("CREDIT".equalsIgnoreCase(tx.getTransactionType())) {
                    totalCredits = totalCredits.add(tx.getAmount());
                } else if ("DEBIT".equalsIgnoreCase(tx.getTransactionType())) {
                    totalDebits = totalDebits.add(tx.getAmount());
                }
            }
        }

        List<StatementGenerateResponse.TransactionRecordDTO> records = txPage.getContent().stream().map(tx ->
                StatementGenerateResponse.TransactionRecordDTO.builder()
                        .transactionId(tx.getId())
                        .accountNumber(tx.getAccount() != null ? tx.getAccount().getAccountNumber() : "N/A")
                        .valueDate(tx.getValueDate())
                        .bookingDate(tx.getBookingDate())
                        .transactionType(tx.getTransactionType())
                        .amount(tx.getAmount())
                        .balanceAfter(tx.getRunningBalance())
                        .referenceNumber(tx.getReferenceNumber())
                        .description(tx.getDescription())
                        .chequeNumber(tx.getChequeNumber())
                        .build()
        ).collect(Collectors.toList());

        String statementId = "stmt_" + UUID.randomUUID().toString().substring(0, 8);

        auditLoggerService.logEvent(
                userId,
                "GENERATE_PREVIEW",
                statementId,
                "127.0.0.1",
                "CitiDirect/1.0",
                request
        );

        return StatementGenerateResponse.builder()
                .statementId(statementId)
                .entityName(request.getEntityId() != null ? request.getEntityId() : "Citigroup NA Treasury")
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .openingBalance(openingBalance)
                .closingBalance(closingBalance)
                .totalDebits(totalDebits)
                .totalCredits(totalCredits)
                .totalRecords(txPage.getTotalElements())
                .records(records)
                .build();
    }
}
