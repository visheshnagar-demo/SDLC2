package com.citi.cashstatement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
public class Transaction {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "booking_date", nullable = false)
    private OffsetDateTime bookingDate;

    @Column(name = "value_date", nullable = false)
    private OffsetDateTime valueDate;

    @Column(name = "transaction_type", nullable = false, length = 16)
    private String transactionType; // DEBIT or CREDIT

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal amount;

    @Column(name = "running_balance", nullable = false, precision = 18, scale = 4)
    private BigDecimal runningBalance;

    @Column(name = "reference_number", nullable = false, length = 64)
    private String referenceNumber;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "cheque_number", length = 32)
    private String chequeNumber;
}
