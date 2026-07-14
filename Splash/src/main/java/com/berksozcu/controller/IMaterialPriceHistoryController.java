package com.berksozcu.controller;

import com.berksozcu.dto.material_price_history.MaterialPriceHistoryDto;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface IMaterialPriceHistoryController {
     List<MaterialPriceHistoryDto> getHistoryAllYear(Long materialId, String schemaName, InvoiceType invoiceType);

     List<MaterialPriceHistoryDto> getHistoryByYear(Long materialId, InvoiceType invoiceType, String schemaName,
                                                 int year);

     List<MaterialPriceHistoryDto> getHistoryByCustomerAndYear(Long customerId, Long materialId,
  InvoiceType invoiceType, String schemaName, int year);

     List<MaterialPriceHistoryDto> getHistoryByCustomerAndAllYear(Long customerId, Long materialId,
           String schemaName, InvoiceType invoiceType);
}
