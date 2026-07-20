package com.berksozcu.controller;

import com.berksozcu.dto.collection.CollectionDto;
import org.springframework.data.domain.Page;

public interface IPaymentCompanyController {
     CollectionDto addPaymentCompany(Long id, CollectionDto paymentCompany, String schemaName);
     CollectionDto editPaymentCompany(Long id, CollectionDto paymentCompany, String schemaName);
     void deletePaymentCompany(Long id, String schemaName);
     Page<CollectionDto> getPaymentCollectionsByYear(int page, int size, String search, int year, String schemaName);
}
