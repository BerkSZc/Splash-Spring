package com.berksozcu.dto.customer;


import lombok.*;

import java.math.BigDecimal;

@Data
public class CustomerDto {

    private Long id;

    private String code;

    private String name;

    private String address;

    private String country;

    private String local;

    private String district;

    private String vdNo;

    private BigDecimal yearlyCredit = BigDecimal.ZERO;

    private BigDecimal yearlyDebit = BigDecimal.ZERO;

    private BigDecimal finalBalance = BigDecimal.ZERO;

    private Long companyId;

    private boolean archived = false;
}