package com.berksozcu.controller.impl;

import com.berksozcu.controller.IOpeningVoucherController;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.service.IOpeningVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rest/api/voucher")
public class OpeningVoucherControllerImpl implements IOpeningVoucherController {

    @Autowired
    private IOpeningVoucherService openingVoucherService;

    @Autowired
    private CustomerRepository customerRepository;


    @PostMapping("/transfer-all")
    @Override
    public String transferAll(@RequestParam int targetYear, @RequestParam String schemaName) {
        openingVoucherService.transferAllCustomers(targetYear, schemaName);
        return "Transfer tamamlandı";
    }

    @GetMapping("/get-all-by-year")
    @Override
    public List<OpeningVoucher> getOpeningVoucherByCustomerAndYear(@RequestParam LocalDate date, @RequestParam String schemaName) {
       return openingVoucherService.getAllOpeningVoucherByCustomer(date, schemaName);
    }

    @GetMapping("/get-by-year")
    @Override
    public OpeningVoucher getOpeningVoucherByCustomerAndYear(@RequestParam Long customerId, @RequestParam LocalDate date,
                                                             @RequestParam String schemaName) {
       return openingVoucherService.getOpeningVoucherByCustomer(customerId, date, schemaName);
    }
}
