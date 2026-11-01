package com.citidirect.cashstatement.masterdata.repository;

import com.citidirect.cashstatement.masterdata.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    @Query("SELECT c FROM Customer c WHERE LOWER(c.customerNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.customerName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(@Param("query") String query);
}
