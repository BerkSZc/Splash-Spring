package com.berksozcu.service.impl;

import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.repository.MaterialPriceHistoryRepository;
import com.berksozcu.service.IMaterialPriceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaterialPriceHistoryServiceImpl implements IMaterialPriceHistoryService {

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Override
    public List<MaterialPriceHistory> getHistoryAllYear(Long materialId,
                     InvoiceType invoiceType) {
        return materialPriceHistoryRepository.
                findByMaterialIdAndInvoiceTypeOrderByDateDesc(materialId, invoiceType);
    }

    @Override
    public List<MaterialPriceHistory> getHistoryByYear(Long materialId, InvoiceType invoiceType,
           int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return materialPriceHistoryRepository.findByMaterialIdAndInvoiceTypeAndDateBetweenOrderByDateDesc(materialId, invoiceType,
                start, end);
    }

    @Override
    public List<MaterialPriceHistory> getHistoryByCustomerAndYear(Long customerId, Long materialId,
                  InvoiceType invoiceType, int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndInvoiceTypeAndDateBetweenOrderByDateDesc(customerId,
                        materialId, invoiceType, start, end);
    }

    @Override
    public List<MaterialPriceHistory> getHistoryByCustomerAndAllYear(Long customerId, Long materialId,
                  InvoiceType invoiceType) {
        return materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndInvoiceTypeOrderByDateDesc(customerId,
                        materialId, invoiceType);
    }
}
