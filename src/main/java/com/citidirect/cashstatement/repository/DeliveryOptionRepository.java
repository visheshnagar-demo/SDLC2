package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.DeliveryOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryOptionRepository extends JpaRepository<DeliveryOption, String> {
    List<DeliveryOption> findByStatus(String status);
    List<DeliveryOption> findByScheduleId(String scheduleId);
}
