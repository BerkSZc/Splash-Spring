package com.berksozcu.dto.collections;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentCompanyDto {

    private Long id;

    private LocalDate date;

    private String comment;

    private BigDecimal price;

    private Long customerId;

    private Long companyId;

    private String customerName;

    private String fileNo;
}
