package com.berksozcu.controller.impl;

import com.berksozcu.controller.IPaymentCompanyController;
import com.berksozcu.entites.PaymentCompany;
import com.berksozcu.service.IPaymentCompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/api/payment")
public class PaymentCompanyControllerImpl implements IPaymentCompanyController {

    @Autowired
    private IPaymentCompanyService paymentCompanyService;


    @Override
    @PostMapping("/add/{id}")
    public PaymentCompany addPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody PaymentCompany paymentCompany) {
        return paymentCompanyService.addPaymentCompany(id, paymentCompany);
    }
}
