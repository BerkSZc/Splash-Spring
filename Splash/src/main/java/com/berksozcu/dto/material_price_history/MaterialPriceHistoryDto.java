package com.berksozcu.dto.material_price_history;

import com.berksozcu.entites.material_price_history.InvoiceType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialPriceHistoryDto {

    private Long id;

    private Long materialId;

    private InvoiceType invoiceType;

    private Long invoiceId;

    private BigDecimal price;

    private LocalDate date;

    private String customerName;

    private BigDecimal quantity;

    private Long customerId;

    private Long companyId;
}
