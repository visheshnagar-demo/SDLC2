package com.citidirect.cashstatement.masterdata.repository;

import com.citidirect.cashstatement.masterdata.model.UserEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserEntitlementRepository extends JpaRepository<UserEntitlement, String> {

    List<UserEntitlement> findByUserId(String userId);

    List<UserEntitlement> findByUserIdAndEntityType(String userId, String entityType);
}
