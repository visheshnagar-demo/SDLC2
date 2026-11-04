package com.citi.cashstatement;

import com.citi.cashstatement.entity.Account;
import com.citi.cashstatement.entity.Transaction;
import com.citi.cashstatement.repository.AccountRepository;
import com.citi.cashstatement.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@SpringBootApplication
public class CashStatementApplication {

    public static void main(String[] args) {
        SpringApplication.run(CashStatementApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        return args -> {
            if (accountRepository.count() == 0) {
                Account acc1 = new Account();
                acc1.setId(UUID.randomUUID().toString());
                acc1.setAccountNumber("ACC-100234");
                acc1.setAccountName("Citigroup NA Treasury Operating");
                acc1.setCurrency("USD");
                acc1.setEntityId("ENT-CITI-NA");
                acc1.setBranchCode("NY-001");
                acc1.setIsActive(true);
                acc1.setCreatedAt(OffsetDateTime.now());
                acc1.setUpdatedAt(OffsetDateTime.now());
                accountRepository.save(acc1);

                Account acc2 = new Account();
                acc2.setId(UUID.randomUUID().toString());
                acc2.setAccountNumber("ACC-100235");
                acc2.setAccountName("Citigroup EMEA Liquidity Account");
                acc2.setCurrency("EUR");
                acc2.setEntityId("ENT-CITI-EMEA");
                acc2.setBranchCode("LON-002");
                acc2.setIsActive(true);
                acc2.setCreatedAt(OffsetDateTime.now());
                acc2.setUpdatedAt(OffsetDateTime.now());
                accountRepository.save(acc2);

                Account acc3 = new Account();
                acc3.setId(UUID.randomUUID().toString());
                acc3.setAccountNumber("ACC-100236");
                acc3.setAccountName("Citigroup APAC Settlement Account");
                acc3.setCurrency("USD");
                acc3.setEntityId("ENT-CITI-APAC");
                acc3.setBranchCode("SGP-003");
                acc3.setIsActive(true);
                acc3.setCreatedAt(OffsetDateTime.now());
                acc3.setUpdatedAt(OffsetDateTime.now());
                accountRepository.save(acc3);

                // Sample transactions for ACC-100234
                Transaction tx1 = new Transaction();
                tx1.setId(UUID.randomUUID().toString());
                tx1.setAccount(acc1);
                tx1.setBookingDate(OffsetDateTime.now().minusDays(10));
                tx1.setValueDate(OffsetDateTime.now().minusDays(10));
                tx1.setTransactionType("CREDIT");
                tx1.setAmount(new BigDecimal("250000.00"));
                tx1.setRunningBalance(new BigDecimal("15670500.50"));
                tx1.setReferenceNumber("REF-WIRE-9921");
                tx1.setDescription("Incoming wire transfer from Global Liquidity Fund");
                transactionRepository.save(tx1);

                Transaction tx2 = new Transaction();
                tx2.setId(UUID.randomUUID().toString());
                tx2.setAccount(acc1);
                tx2.setBookingDate(OffsetDateTime.now().minusDays(5));
                tx2.setValueDate(OffsetDateTime.now().minusDays(5));
                tx2.setTransactionType("DEBIT");
                tx2.setAmount(new BigDecimal("75000.00"));
                tx2.setRunningBalance(new BigDecimal("15595500.50"));
                tx2.setReferenceNumber("REF-OUT-4412");
                tx2.setDescription("Outgoing corporate vendor settlement");
                transactionRepository.save(tx2);

                Transaction tx3 = new Transaction();
                tx3.setId(UUID.randomUUID().toString());
                tx3.setAccount(acc1);
                tx3.setBookingDate(OffsetDateTime.now().minusDays(1));
                tx3.setValueDate(OffsetDateTime.now().minusDays(1));
                tx3.setTransactionType("CREDIT");
                tx3.setAmount(new BigDecimal("1200000.00"));
                tx3.setRunningBalance(new BigDecimal("16795500.50"));
                tx3.setReferenceNumber("REF-SWIFT-8831");
                tx3.setDescription("SWIFT MT103 Interbank Credit Transfer");
                transactionRepository.save(tx3);
            }
        };
    }
}
