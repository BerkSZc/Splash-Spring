package com.berksozcu.service;

import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;

import java.util.List;

public interface IMaterialPriceHistoryService {
     List<MaterialPriceHistory> getHistoryAllYear(Long materialId, String schemaName,
                                                                             InvoiceType invoiceType);
     List<MaterialPriceHistory> getHistoryByYear(Long materialId, InvoiceType invoiceType,
                                                       String schemaName,
                                                       int year);

     List<MaterialPriceHistory> getHistoryByCustomerAndYear(Long customerId, Long materialId,
                                                                  InvoiceType invoiceType, String schemaName, int year);

     List<MaterialPriceHistory> getHistoryByCustomerAndAllYear(Long customerId, Long materialId,
                                                                     String schemaName,
                                                                     InvoiceType invoiceType);
}
