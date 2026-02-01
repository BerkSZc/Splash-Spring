package com.berksozcu.service;

import com.berksozcu.entites.material_price_history.InvoiceType;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ICommonDataService {
     void updateRatesFromTcmb();
     BigDecimal getRateOrDefault(String currency, LocalDate invoiceDate);
     BigDecimal getTodaysRate(String code, LocalDate invoiceDate);
     String generateFileNo(LocalDate date, String type);
}
