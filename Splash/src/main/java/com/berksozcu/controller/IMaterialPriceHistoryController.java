package com.berksozcu.controller;

import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface IMaterialPriceHistoryController {
     List<MaterialPriceHistory> getHistoryAllYear(Long materialId,  InvoiceType invoiceType);

     List<MaterialPriceHistory> getHistoryByYear(Long materialId, InvoiceType invoiceType, int year);

     List<MaterialPriceHistory> getHistoryByCustomerAndYear(Long customerId, Long materialId,
  InvoiceType invoiceType, int year);

     List<MaterialPriceHistory> getHistoryByCustomerAndAllYear(Long customerId, Long materialId,
           InvoiceType invoiceType);
}
