package com.berksozcu.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DtoMonthlyKdv {
    private int month;
    private int year;
    private BigDecimal totalAmount; // KDV siz tutar
    private BigDecimal totalKdv;
    private BigDecimal netTotal;
}
