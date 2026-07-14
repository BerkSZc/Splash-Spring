package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.IPaymentCompanyController;
import com.berksozcu.dto.collections.PaymentCompanyDto;
import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.service.IPaymentCompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/payment")
@RateLimit(capacity = 5000)
public class PaymentCompanyControllerImpl implements IPaymentCompanyController {

    @Autowired
    private IPaymentCompanyService paymentCompanyService;


    @Override
    @PostMapping("/add/{id}")
    public PaymentCompanyDto addPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody PaymentCompanyDto paymentCompany,
                                               @RequestParam String schemaName) {
        return paymentCompanyService.addPaymentCompany(id, paymentCompany, schemaName);
    }

    @Override
    @PutMapping("/edit/{id}")
    public void editPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody PaymentCompanyDto paymentCompany,
                                             @RequestParam String schemaName) {
         paymentCompanyService.editPaymentCompany(id, paymentCompany, schemaName);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deletePaymentCompany(@PathVariable(name = "id") Long id, @RequestParam String schemaName) {
         paymentCompanyService.deletePaymentCompany(id, schemaName);
    }

    @Override
    @GetMapping("/find-by-year")
    public Page<PaymentCompanyDto> getPaymentCollectionsByYear(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "20") int size,
                                                            @RequestParam(required = false) String search,
                                                            @RequestParam int year,
                                                            @RequestParam String schemaName) {
        return paymentCompanyService.getPaymentCollectionsByYear(page, size, search, year, schemaName);
    }

}
