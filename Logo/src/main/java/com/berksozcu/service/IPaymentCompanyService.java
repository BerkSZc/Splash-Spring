package com.berksozcu.service;

import com.berksozcu.entites.collections.PaymentCompany;

import java.util.List;

public interface IPaymentCompanyService {
    public PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany);
    public List<PaymentCompany> getAll();
    public PaymentCompany editPaymentCompany(Long id, PaymentCompany paymentCompany);
    public void deletePaymentCompany(Long id);
}
