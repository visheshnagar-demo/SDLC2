package com.citi.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDTO {

    @JsonProperty("id")
    private String id;

    @JsonProperty("schedule_name")
    private String scheduleName;

    @JsonProperty("template_id")
    private String templateId;

    @JsonProperty("criteria")
    private Map<String, Object> criteria;

    @JsonProperty("frequency")
    private String frequency;

    @JsonProperty("cron_expression")
    private String cronExpression;

    @JsonProperty("export_format")
    private String exportFormat;

    @JsonProperty("delivery_options")
    private Map<String, Object> deliveryOptions;

    @JsonProperty("status")
    private String status;

    @JsonProperty("created_by")
    private String createdBy;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @JsonProperty("updated_at")
    private OffsetDateTime updatedAt;
}
