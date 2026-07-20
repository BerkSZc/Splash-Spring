package com.berksozcu.dto.invoice;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceDto {

        private Long id;

        private LocalDate date;

        private String fileNo;

        private Long customerId;

        private String customerName;

        private String customerCode;

        private BigDecimal kdvToplam;

        private BigDecimal finalBalance;

        private BigDecimal totalPrice;

        private BigDecimal eurSellingRate;

        private BigDecimal usdSellingRate;

        private boolean invoiced = false;

        private Long companyId;

        private List<InvoiceItemDto> items;
}
