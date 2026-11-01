package com.citidirect.cashstatement.masterdata.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_entitlements")
public class UserEntitlement {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "entity_type", nullable = false, length = 30)
    private String entityType; // BRANCH, CUSTOMER, ACCOUNT

    @Column(name = "entity_id", nullable = false, length = 50)
    private String entityId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public UserEntitlement() {}

    public UserEntitlement(String id, String userId, String entityType, String entityId) {
        this.id = id;
        this.userId = userId;
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
