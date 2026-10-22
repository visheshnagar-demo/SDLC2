package com.reinsurance.portal.repository;

import com.reinsurance.portal.entity.UnderwritingAuthorityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnderwritingAuthorityRepository extends JpaRepository<UnderwritingAuthorityEntity, UUID> {
    Optional<UnderwritingAuthorityEntity> findByRoleName(String roleName);
}
