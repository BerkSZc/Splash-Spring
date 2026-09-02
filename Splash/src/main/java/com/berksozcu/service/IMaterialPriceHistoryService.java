package com.berksozcu.service;

import com.berksozcu.dto.material_price_history.MaterialPriceHistoryDto;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IMaterialPriceHistoryService {
    Page<MaterialPriceHistoryDto> getHistoryAllYear(int page, int size, String search, Long materialId, String schemaName,
                                                     InvoiceType invoiceType);
    Page<MaterialPriceHistoryDto> getHistoryByYear(int page, int size, String search, Long materialId, InvoiceType invoiceType,
                                                   String schemaName,
                                                   int year);

    Page<MaterialPriceHistoryDto> getHistoryByCustomerAndYear(int page, int size, String search, Long customerId, Long materialId,
                                                                  InvoiceType invoiceType, String schemaName, int year);

    Page<MaterialPriceHistoryDto> getHistoryByCustomerAndAllYear(int page, int size, String search, Long customerId, Long materialId,
                                                                     String schemaName,
                                                                     InvoiceType invoiceType);
}
