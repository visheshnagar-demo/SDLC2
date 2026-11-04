package com.citi.cashstatement.repository;

import com.citi.cashstatement.entity.MakerCheckerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MakerCheckerRequestRepository extends JpaRepository<MakerCheckerRequest, String> {
    List<MakerCheckerRequest> findByStatus(String status);
    Optional<MakerCheckerRequest> findByResourceTypeAndResourceId(String resourceType, String resourceId);
    List<MakerCheckerRequest> findByMakerId(String makerId);
}
