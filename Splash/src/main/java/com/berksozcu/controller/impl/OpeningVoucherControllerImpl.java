package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.IOpeningVoucherController;
import com.berksozcu.dto.customer.OpeningVoucherDto;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.service.IOpeningVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rest/api/voucher")
@RateLimit(capacity = 5000)
public class OpeningVoucherControllerImpl implements IOpeningVoucherController {

    @Autowired
    private IOpeningVoucherService openingVoucherService;

    @PostMapping("/transfer-all")
    @Override
    public String transferAll(@RequestParam int targetYear, @RequestParam String schemaName) {
        openingVoucherService.transferAllCustomers(targetYear, schemaName);
        return "Transfer tamamlandı";
    }

    @GetMapping("/get-all-by-year")
    @Override
    public List<OpeningVoucherDto> getAllOpeningVoucherByCustomerAndYear(@RequestParam LocalDate date, @RequestParam String schemaName) {
       return openingVoucherService.getAllOpeningVoucherByCustomer(date, schemaName);
    }

    @GetMapping("/get-by-year")
    @Override
    public OpeningVoucherDto getOpeningVoucherByCustomerAndYear(@RequestParam Long customerId, @RequestParam LocalDate date,
                                                             @RequestParam String schemaName) {
       return openingVoucherService.getOpeningVoucherByCustomer(customerId, date, schemaName);
    }
}
