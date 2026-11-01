package com.citidirect.cashstatement.masterdata.repository;

import com.citidirect.cashstatement.masterdata.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    List<Account> findByCustomerNumber(String customerNumber);

    List<Account> findByBranchNumber(String branchNumber);

    List<Account> findByCustomerNumberAndBranchNumber(String customerNumber, String branchNumber);

    @Query("SELECT a FROM Account a WHERE LOWER(a.accountNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.accountName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Account> searchAccounts(@Param("query") String query);
}
