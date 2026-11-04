package com.citi.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class StatementGenerateRequest {

    @JsonProperty("account_numbers")
    private List<String> accountNumbers;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("entity_id")
    private String entityId;

    @JsonProperty("date_from")
    private OffsetDateTime dateFrom;

    @JsonProperty("date_to")
    private OffsetDateTime dateTo;

    @JsonProperty("statement_type")
    private String statementType; // SUMMARY, DETAILED, INTERIM

    @JsonProperty("page")
    private Integer page = 0;

    @JsonProperty("size")
    private Integer size = 50;
}
