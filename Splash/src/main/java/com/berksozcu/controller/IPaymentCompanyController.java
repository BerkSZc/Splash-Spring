package com.berksozcu.controller;

import com.berksozcu.entites.collections.PaymentCompany;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface IPaymentCompanyController {
     PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany);
     List<PaymentCompany> getAll();
     PaymentCompany editPaymentCompany(@PathVariable(name = "id") Long id, @RequestBody PaymentCompany paymentCompany);
     void deletePaymentCompany(@PathVariable(name = "id") Long id);
     List<PaymentCompany> getPaymentCollectionsByYear(@PathVariable(name = "year") int year);
}
