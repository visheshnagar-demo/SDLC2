package com.reinsurance.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "underwriting_authorities")
public class UnderwritingAuthorityEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "underwriter_id", nullable = false, unique = true)
    private String underwriterId;

    @Column(name = "role_name", nullable = false)
    private String roleName;

    @Column(name = "authority_limit", precision = 19, scale = 2, nullable = false)
    private BigDecimal authorityLimit;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }

    public UnderwritingAuthorityEntity() {}

    public UnderwritingAuthorityEntity(String underwriterId, String roleName, BigDecimal authorityLimit) {
        this.id = UUID.randomUUID();
        this.underwriterId = underwriterId;
        this.roleName = roleName;
        this.authorityLimit = authorityLimit;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUnderwriterId() { return underwriterId; }
    public void setUnderwriterId(String underwriterId) { this.underwriterId = underwriterId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public BigDecimal getAuthorityLimit() { return authorityLimit; }
    public void setAuthorityLimit(BigDecimal authorityLimit) { this.authorityLimit = authorityLimit; }
}
