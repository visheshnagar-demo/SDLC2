package com.identiverify.repository;

import com.identiverify.entity.User;
import com.identiverify.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, UUID> {
    List<VerificationRequest> findByUserOrderByCreatedAtDesc(User user);
    List<VerificationRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<VerificationRequest> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
    List<VerificationRequest> findByStatusOrderByCreatedAtDesc(String status);
}
