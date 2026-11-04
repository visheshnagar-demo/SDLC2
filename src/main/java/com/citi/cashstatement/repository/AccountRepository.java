package com.citi.cashstatement.repository;

import com.citi.cashstatement.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByAccountNumber(String accountNumber);
    List<Account> findByEntityId(String entityId);
    List<Account> findByIsActiveTrue();
}
