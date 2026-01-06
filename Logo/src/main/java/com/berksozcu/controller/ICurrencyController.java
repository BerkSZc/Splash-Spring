package com.berksozcu.controller;

import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

public interface ICurrencyController {
     BigDecimal convertToTry(@RequestParam(required = false) String code,
                                   @RequestParam(required = false) BigDecimal amount);
}
