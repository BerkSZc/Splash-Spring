package com.berksozcu.dto.material;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material.Currency;
import com.berksozcu.entites.material.MaterialUnit;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDto {

    private Long id;

    private String code;

    private String comment;

    private Long companyId;

    private MaterialUnit unit;

    private BigDecimal purchasePrice;

    private Currency purchaseCurrency = Currency.TRY;

    private BigDecimal salesPrice;

    private Currency salesCurrency= Currency.TRY;

    private boolean archived = false;
}
