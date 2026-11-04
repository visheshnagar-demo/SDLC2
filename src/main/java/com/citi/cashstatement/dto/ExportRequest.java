package com.citi.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class ExportRequest {

    @JsonProperty("criteria")
    private StatementGenerateRequest criteria;

    @JsonProperty("export_format")
    private String exportFormat; // PDF, EXCEL, CSV

    @JsonProperty("delivery_options")
    private Map<String, Object> deliveryOptions;
}
