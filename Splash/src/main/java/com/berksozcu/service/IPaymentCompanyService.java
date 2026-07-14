package com.berksozcu.service;

import com.berksozcu.dto.collections.PaymentCompanyDto;
import com.berksozcu.entites.collections.PaymentCompany;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IPaymentCompanyService {
     PaymentCompanyDto addPaymentCompany(Long id, PaymentCompanyDto paymentCompany, String schemaName);
     void editPaymentCompany(Long id, PaymentCompanyDto paymentCompany, String schemaName);
     void deletePaymentCompany(Long id, String schemaName);
     Page<PaymentCompanyDto> getPaymentCollectionsByYear(int page, int size, String search, int year, String schemaName);
}
