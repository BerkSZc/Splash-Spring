package com.berksozcu.controller.impl;

import com.berksozcu.controller.IPaymentCompanyController;
import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.service.IPaymentCompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/payment")
public class PaymentCompanyControllerImpl implements IPaymentCompanyController {

    @Autowired
    private IPaymentCompanyService paymentCompanyService;


    @Override
    @PostMapping("/add/{id}")
    public PaymentCompany addPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody PaymentCompany paymentCompany,
                                            @RequestParam String schemaName) {
        return paymentCompanyService.addPaymentCompany(id, paymentCompany, schemaName);
    }

    @Override
    @GetMapping("/find-all")
    public List<PaymentCompany> getAll() {
        return paymentCompanyService.getAll();
    }

    @Override
    @PutMapping("/edit/{id}")
    public PaymentCompany editPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody PaymentCompany paymentCompany,
                                             @RequestParam String schemaName) {
        return paymentCompanyService.editPaymentCompany(id, paymentCompany, schemaName);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deletePaymentCompany(@PathVariable(name = "id") Long id, @RequestParam String schemaName) {
         paymentCompanyService.deletePaymentCompany(id, schemaName);
    }

    @Override
    @GetMapping("/find-year/{year}")
    public List<PaymentCompany> getPaymentCollectionsByYear(@PathVariable(name = "year") int year) {
        return paymentCompanyService.getPaymentCollectionsByYear(year);
    }

}
