package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.repository.CompanyRepository;
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

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public List<MaterialPriceHistory> getHistoryAllYear(Long materialId,
            String schemaName
            ,InvoiceType invoiceType) {
        Company company = companyRepository.findBySchemaName(schemaName);
        return materialPriceHistoryRepository.
                findByMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(materialId, company, invoiceType);
    }

    @Override
    public List<MaterialPriceHistory> getHistoryByYear(Long materialId, InvoiceType invoiceType,
           String schemaName,
           int year) {
        Company company = companyRepository.findBySchemaName(schemaName);
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return materialPriceHistoryRepository.findByMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(
                materialId, invoiceType, company,
                start, end);
    }

    @Override
    public List<MaterialPriceHistory> getHistoryByCustomerAndYear(Long customerId, Long materialId,
                  InvoiceType invoiceType, String schemaName, int year) {
        Company company = companyRepository.findBySchemaName(schemaName);
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(customerId,
                        materialId, invoiceType, company, start, end);
    }

    @Override
    public List<MaterialPriceHistory> getHistoryByCustomerAndAllYear(Long customerId, Long materialId,
                  String schemaName, InvoiceType invoiceType) {
        Company company = companyRepository.findBySchemaName(schemaName);
        return materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(customerId,
                        materialId, company, invoiceType);
    }
}
