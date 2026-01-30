package com.berksozcu.service;

import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material_price_history.InvoiceType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ICurrencyRateService {
     void updateRatesFromTcmb();
     BigDecimal getRateOrDefault(String currency, LocalDate invoiceDate);
     BigDecimal getTodaysRate(String code, LocalDate invoiceDate);
     String generateFileNo(LocalDate date, InvoiceType type);
}
