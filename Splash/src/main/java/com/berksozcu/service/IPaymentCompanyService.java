package com.berksozcu.service;

import com.berksozcu.entites.collections.PaymentCompany;

import java.util.List;

public interface IPaymentCompanyService {
     PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany, String schemaName);
     List<PaymentCompany> getAll();
     PaymentCompany editPaymentCompany(Long id, PaymentCompany paymentCompany, String schemaName);
     void deletePaymentCompany(Long id, String schemaName);
     List<PaymentCompany> getPaymentCollectionsByYear(int year);
}
