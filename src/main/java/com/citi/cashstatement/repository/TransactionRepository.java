package com.citi.cashstatement.repository;

import com.citi.cashstatement.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    @Query("SELECT t FROM Transaction t WHERE t.account.accountNumber IN :accountNumbers " +
           "AND (:currency IS NULL OR t.account.currency = :currency) " +
           "AND (:entityId IS NULL OR t.account.entityId = :entityId) " +
           "AND t.valueDate >= :dateFrom AND t.valueDate <= :dateTo " +
           "ORDER BY t.valueDate ASC")
    Page<Transaction> findFilteredTransactions(
            @Param("accountNumbers") List<String> accountNumbers,
            @Param("currency") String currency,
            @Param("entityId") String entityId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE t.account.accountNumber IN :accountNumbers " +
           "AND (:currency IS NULL OR t.account.currency = :currency) " +
           "AND (:entityId IS NULL OR t.account.entityId = :entityId) " +
           "AND t.valueDate >= :dateFrom AND t.valueDate <= :dateTo " +
           "ORDER BY t.valueDate ASC")
    List<Transaction> findFilteredTransactionsList(
            @Param("accountNumbers") List<String> accountNumbers,
            @Param("currency") String currency,
            @Param("entityId") String entityId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo
    );
}
