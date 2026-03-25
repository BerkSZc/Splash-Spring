package com.berksozcu.controller;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface ICommonDataController {
     BigDecimal convertToTry( String code, BigDecimal amount, LocalDate date);

     Map<String, BigDecimal> getTodayRates(LocalDate currencyDate);

     String getFileNo(LocalDate date, String type, String schemaName);
}
