package com.berksozcu.dto.customer;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DtoCustomer {

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

    private boolean archived = false;

}