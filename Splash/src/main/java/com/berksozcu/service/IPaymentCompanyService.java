package com.berksozcu.service;

import com.berksozcu.entites.collections.PaymentCompany;

import java.util.List;

public interface IPaymentCompanyService {
     PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany);
     List<PaymentCompany> getAll();
     PaymentCompany editPaymentCompany(Long id, PaymentCompany paymentCompany);
     void deletePaymentCompany(Long id);
     List<PaymentCompany> getPaymentCollectionsByYear(int year);
}
