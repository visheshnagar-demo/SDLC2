package com.citidirect.cashstatement.delivery.repository;

import com.citidirect.cashstatement.delivery.model.DeliveryOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryOptionRepository extends JpaRepository<DeliveryOption, String> {

    Optional<DeliveryOption> findByName(String name);

    List<DeliveryOption> findByAuthStatus(String authStatus);

    long countByAuthStatus(String authStatus);
}
