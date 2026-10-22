package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "underwriting_authorities")
public class UnderwritingAuthorityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String roleName;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal maxPolicyLimit;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public BigDecimal getMaxPolicyLimit() { return maxPolicyLimit; }
    public void setMaxPolicyLimit(BigDecimal maxPolicyLimit) { this.maxPolicyLimit = maxPolicyLimit; }
}
