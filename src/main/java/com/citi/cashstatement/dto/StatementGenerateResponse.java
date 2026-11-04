package com.citi.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatementGenerateResponse {

    @JsonProperty("statement_id")
    private String statementId;

    @JsonProperty("entity_name")
    private String entityName;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("opening_balance")
    private BigDecimal openingBalance;

    @JsonProperty("closing_balance")
    private BigDecimal closingBalance;

    @JsonProperty("total_debits")
    private BigDecimal totalDebits;

    @JsonProperty("total_credits")
    private BigDecimal totalCredits;

    @JsonProperty("total_records")
    private Long totalRecords;

    @JsonProperty("records")
    private List<TransactionRecordDTO> records;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionRecordDTO {
        @JsonProperty("transaction_id")
        private String transactionId;

        @JsonProperty("account_number")
        private String accountNumber;

        @JsonProperty("value_date")
        private OffsetDateTime valueDate;

        @JsonProperty("booking_date")
        private OffsetDateTime bookingDate;

        @JsonProperty("transaction_type")
        private String transactionType;

        @JsonProperty("amount")
        private BigDecimal amount;

        @JsonProperty("balance_after")
        private BigDecimal balanceAfter;

        @JsonProperty("reference_number")
        private String referenceNumber;

        @JsonProperty("description")
        private String description;

        @JsonProperty("cheque_number")
        private String chequeNumber;
    }
}
