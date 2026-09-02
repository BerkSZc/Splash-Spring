package com.berksozcu.service.impl;

import com.berksozcu.dto.material_price_history.MaterialPriceHistoryDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.MaterialPriceHistoryRepository;
import com.berksozcu.service.IMaterialPriceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class MaterialPriceHistoryServiceImpl implements IMaterialPriceHistoryService {

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public Page<MaterialPriceHistoryDto> getHistoryAllYear(int page, int size, String search, Long materialId, String schemaName, InvoiceType invoiceType) {
        Company company = companyRepository.findBySchemaName(schemaName);
        Pageable pageable = PageRequest.of(page, size);
        String searchParam = prepareSearchParam(search);

        Page<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository.
                findByMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(materialId, company, invoiceType, searchParam, pageable);

        return materialPriceHistories.map(this::convertToDto);
    }

    @Override
    public Page<MaterialPriceHistoryDto> getHistoryByYear(int page, int size, String search, Long materialId, InvoiceType invoiceType,
           String schemaName,
           int year) {
        Company company = companyRepository.findBySchemaName(schemaName);
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        Pageable pageable = PageRequest.of(page, size);
        String searchParam = prepareSearchParam(search);

        Page<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository.findByMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(
                materialId, invoiceType, company,
                start, end, searchParam, pageable);

        return materialPriceHistories.map(this::convertToDto);
    }

    @Override
    public Page<MaterialPriceHistoryDto> getHistoryByCustomerAndYear(int page, int size, String search, Long customerId, Long materialId,
                  InvoiceType invoiceType, String schemaName, int year) {
        Company company = companyRepository.findBySchemaName(schemaName);
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        Pageable pageable = PageRequest.of(page, size);
        String searchParam = prepareSearchParam(search);

        Page<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(customerId,
                        materialId, invoiceType, company, start, end, searchParam, pageable);

        return materialPriceHistories.map(this::convertToDto);
    }

    @Override
    public Page<MaterialPriceHistoryDto> getHistoryByCustomerAndAllYear(int page, int size, String search, Long customerId, Long materialId,
                  String schemaName, InvoiceType invoiceType) {
        Company company = companyRepository.findBySchemaName(schemaName);
        Pageable pageable = PageRequest.of(page, size);
        String searchParam = prepareSearchParam(search);

        Page<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(customerId,
                        materialId, company, invoiceType, searchParam, pageable);

        return materialPriceHistories.map(this::convertToDto);
    }

    private MaterialPriceHistoryDto convertToDto(MaterialPriceHistory entity) {
        MaterialPriceHistoryDto dto = new MaterialPriceHistoryDto();
        dto.setId(entity.getId());
        dto.setCompanyId(entity.getCompany() != null ? entity.getCompany().getId() : null);
        dto.setMaterialId(entity.getMaterial() != null ? entity.getMaterial().getId() : null);
        dto.setCustomerId(entity.getCustomer() != null ? entity.getCustomer().getId() : null);
        dto.setPrice(entity.getPrice());
        dto.setDate(entity.getDate());
        dto.setInvoiceType(entity.getInvoiceType());
        dto.setQuantity(entity.getQuantity());
        dto.setCustomerName(entity.getCustomer() != null ? entity.getCustomer().getName() : null);
        return dto;
    }

    private String prepareSearchParam(String search) {
        if (search == null || search.trim().isEmpty()) {
            return null;
        }
        String normalized = search
                .replace("İ", "i")
                .replace("I", "ı")
                .toLowerCase(Locale.forLanguageTag("tr-TR"))
                .replace("ı", "i")
                .replace("ğ", "g")
                .replace("ü", "u")
                .replace("ş", "s")
                .replace("ö", "o")
                .replace("ç", "c")
                .trim();

        return "%" + normalized + "%";
    }
}
