package com.citidirect.cashstatement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "base_reports")
public class BaseReport {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "report_code", nullable = false, unique = true, length = 50)
    private String reportCode;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "format_standard", length = 100)
    private String formatStandard;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "default_frequency", length = 100)
    private String defaultFrequency;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public BaseReport() {}

    public BaseReport(String id, String reportCode, String name, String formatStandard, String category, String defaultFrequency, String description) {
        this.id = id;
        this.reportCode = reportCode;
        this.name = name;
        this.formatStandard = formatStandard;
        this.category = category;
        this.defaultFrequency = defaultFrequency;
        this.description = description;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReportCode() { return reportCode; }
    public void setReportCode(String reportCode) { this.reportCode = reportCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFormatStandard() { return formatStandard; }
    public void setFormatStandard(String formatStandard) { this.formatStandard = formatStandard; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDefaultFrequency() { return defaultFrequency; }
    public void setDefaultFrequency(String defaultFrequency) { this.defaultFrequency = defaultFrequency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
