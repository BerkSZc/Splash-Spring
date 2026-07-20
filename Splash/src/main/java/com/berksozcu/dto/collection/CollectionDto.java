package com.berksozcu.dto.collection;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CollectionDto {

    private Long id;

    private LocalDate date;

    private String comment;

    private BigDecimal price;

    private Long customerId;

    private Long companyId;

    private String customerName;

    private BigDecimal finalBalance;

    private String fileNo;
}
