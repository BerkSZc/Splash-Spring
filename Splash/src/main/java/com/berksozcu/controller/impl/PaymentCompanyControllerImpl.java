package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.IPaymentCompanyController;
import com.berksozcu.dto.collection.CollectionDto;
import com.berksozcu.service.IPaymentCompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/api/payment")
@RateLimit(capacity = 5000)
public class PaymentCompanyControllerImpl implements IPaymentCompanyController {

    @Autowired
    private IPaymentCompanyService paymentCompanyService;


    @Override
    @PostMapping("/add/{id}")
    public CollectionDto addPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody CollectionDto paymentCompany,
                                           @RequestParam String schemaName) {
        return paymentCompanyService.addPaymentCompany(id, paymentCompany, schemaName);
    }

    @Override
    @PutMapping("/edit/{id}")
    public CollectionDto editPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody CollectionDto paymentCompany,
                                             @RequestParam String schemaName) {
        return paymentCompanyService.editPaymentCompany(id, paymentCompany, schemaName);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deletePaymentCompany(@PathVariable(name = "id") Long id, @RequestParam String schemaName) {
         paymentCompanyService.deletePaymentCompany(id, schemaName);
    }

    @Override
    @GetMapping("/find-by-year")
    public Page<CollectionDto> getPaymentCollectionsByYear(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size,
                                                           @RequestParam(required = false) String search,
                                                           @RequestParam int year,
                                                           @RequestParam String schemaName) {
        return paymentCompanyService.getPaymentCollectionsByYear(page, size, search, year, schemaName);
    }

}
