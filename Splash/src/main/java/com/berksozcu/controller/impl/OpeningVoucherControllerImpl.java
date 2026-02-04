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
    public String transferAll(@RequestParam int targetYear, @RequestParam String schemaName) {
        openingVoucherService.transferAllCustomers(targetYear, schemaName);
        return "Transfer tamamlandı";
    }

    @GetMapping("/get-all-by-year")
    public List<OpeningVoucher> getOpeningVoucherByCustomerAndYear(@RequestParam LocalDate date) {
       return openingVoucherService.getAllOpeningVoucherByCustomer(date);
    }
    @GetMapping("/get-by-year")
    public OpeningVoucher getOpeningVoucherByCustomerAndYear(@RequestParam Long customerId, @RequestParam LocalDate date) {
       return openingVoucherService.getOpeningVoucherByCustomer(customerId, date);
    }
}
