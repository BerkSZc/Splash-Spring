package com.berksozcu.controller;

import com.berksozcu.entites.collections.PaymentCompany;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface IPaymentCompanyController {
    public PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany);
    public List<PaymentCompany> getAll();
    public PaymentCompany editPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody PaymentCompany paymentCompany);
    public void deletePaymentCompany(@PathVariable(name = "id") Long id);
}
