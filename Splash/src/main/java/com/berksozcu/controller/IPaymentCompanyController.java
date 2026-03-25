package com.berksozcu.controller;

import com.berksozcu.entites.collections.PaymentCompany;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IPaymentCompanyController {
     PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany, String schemaName);
     PaymentCompany editPaymentCompany( Long id, PaymentCompany paymentCompany, String schemaName);
     void deletePaymentCompany(Long id, String schemaName);
     Page<PaymentCompany> getPaymentCollectionsByYear( int page, int size, String search, int year, String schemaName);
}
