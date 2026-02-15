package com.berksozcu.controller.impl;

import com.berksozcu.controller.ICommonDataController;
import com.berksozcu.entites.currency.CurrencyRate;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CurrencyRateRepository;
import com.berksozcu.service.ICommonDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/rest/api/currency")
public class CommonDataControllerImpl implements ICommonDataController {

    @Autowired
    private ICommonDataService currencyRateService;

    @Autowired
    private CurrencyRateRepository currencyRateRepository;

    @GetMapping("/convert")
    @Override
    public BigDecimal convertToTry(@RequestParam(required = false) String code,
                                   @RequestParam(required = false) BigDecimal amount,
                                   @RequestParam LocalDate date) {

        if(code == null || amount == null) {
            return amount != null ? amount : BigDecimal.ZERO;
        }

        if("TRY".equals(code)) return amount;

        CurrencyRate rate = currencyRateRepository.findByCurrencyAndLastUpdated(code, date)
                .orElse(null);

        BigDecimal selectedRate = rate != null ? rate.getSellingRate() : BigDecimal.ONE;
        return amount.multiply(selectedRate).setScale(2, RoundingMode.HALF_UP);
    }

    @GetMapping("/today-rates")
    @Override
    public Map<String, BigDecimal> getTodayRates(@RequestParam LocalDate currencyDate) {
    Map<String, BigDecimal> rates = new HashMap<>();

    rates.put("EUR", currencyRateService.getTodaysRate("EUR", currencyDate));
    rates.put("USD", currencyRateService.getTodaysRate("USD", currencyDate));

    return rates;
    }

    @GetMapping("/file-no")
    public String getFileNo(@RequestParam LocalDate date, @RequestParam String type) {
        return currencyRateService.generateFileNo(date, type);
    }
}
