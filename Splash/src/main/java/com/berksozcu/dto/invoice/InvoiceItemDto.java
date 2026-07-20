package com.berksozcu.dto.invoice;

import com.berksozcu.entites.material.MaterialUnit;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceItemDto {

    private Long id;

    private Long invoiceId;

    private Long materialId;

    private String materialName;

    private String materialCode;

    private BigDecimal unitPrice;

    private Long companyId;

    private MaterialUnit unit;

    private BigDecimal quantity;

    private BigDecimal kdv;

    private BigDecimal kdvTutar;

    private BigDecimal lineTotal;
}
