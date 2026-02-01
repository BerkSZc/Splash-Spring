package com.berksozcu.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface ICommonDataController {
     BigDecimal convertToTry(@RequestParam(required = false) String code,
                                   @RequestParam(required = false) BigDecimal amount);
     Map<String, BigDecimal> getTodayRates(
            @RequestParam("currencyDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate currencyDate
    );
}
