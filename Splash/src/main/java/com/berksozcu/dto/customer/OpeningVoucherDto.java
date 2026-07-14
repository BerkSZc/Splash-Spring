package com.berksozcu.dto.customer;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class OpeningVoucherDto {

    private Long id;

    private Long customerId;

    private Long companyId;

    private String customerName;

    private String fileNo;

    private String description;

    private LocalDate date;

    private BigDecimal debit;

    private BigDecimal credit;

    private BigDecimal finalBalance;

    private BigDecimal yearlyDebit;

    private BigDecimal yearlyCredit;
}
