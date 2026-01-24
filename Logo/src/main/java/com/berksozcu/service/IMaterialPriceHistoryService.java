package com.berksozcu.service;

import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;

import java.util.List;

public interface IMaterialPriceHistoryService {
    public List<MaterialPriceHistory> getHistoryAllYear(Long materialId,
                                                                             InvoiceType invoiceType);
    public List<MaterialPriceHistory> getHistoryByYear(Long materialId, InvoiceType invoiceType,
                                                       int year);
}
