package com.citidirect.cashstatement.masterdata.repository;

import com.citidirect.cashstatement.masterdata.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    List<Transaction> findByAccountNumberOrderByStatementDateAscCreatedAtAsc(String accountNumber);

    @Query("SELECT t FROM Transaction t WHERE t.accountNumber = :accountNumber " +
           "AND (:startDate IS NULL OR t.statementDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.statementDate <= :endDate) " +
           "ORDER BY t.statementDate ASC, t.createdAt ASC")
    List<Transaction> findByAccountAndStatementDateRange(
            @Param("accountNumber") String accountNumber,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.accountNumber = :accountNumber " +
           "AND (:startDate IS NULL OR t.valueDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.valueDate <= :endDate) " +
           "ORDER BY t.valueDate ASC, t.createdAt ASC")
    List<Transaction> findByAccountAndValueDateRange(
            @Param("accountNumber") String accountNumber,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
