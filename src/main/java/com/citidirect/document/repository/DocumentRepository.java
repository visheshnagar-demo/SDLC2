package com.citidirect.document.repository;

import com.citidirect.document.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, String> {

    List<DocumentEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<DocumentEntity> findByIdAndUserId(String id, String userId);
}
