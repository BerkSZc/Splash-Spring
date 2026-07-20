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
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialPriceHistoryServiceImpl implements IMaterialPriceHistoryService {

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public List<MaterialPriceHistoryDto> getHistoryAllYear(Long materialId,
                                                           String schemaName
            , InvoiceType invoiceType) {
        Company company = companyRepository.findBySchemaName(schemaName);
        List<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository.
                findByMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(materialId, company, invoiceType);

      return convertToDto(materialPriceHistories);
    }

    @Override
    public List<MaterialPriceHistoryDto> getHistoryByYear(Long materialId, InvoiceType invoiceType,
           String schemaName,
           int year) {
        Company company = companyRepository.findBySchemaName(schemaName);
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository.findByMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(
                materialId, invoiceType, company,
                start, end);

        return convertToDto(materialPriceHistories);
    }

    @Override
    public List<MaterialPriceHistoryDto> getHistoryByCustomerAndYear(Long customerId, Long materialId,
                  InvoiceType invoiceType, String schemaName, int year) {
        Company company = companyRepository.findBySchemaName(schemaName);
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(customerId,
                        materialId, invoiceType, company, start, end);

      return convertToDto(materialPriceHistories);
    }

    @Override
    public List<MaterialPriceHistoryDto> getHistoryByCustomerAndAllYear(Long customerId, Long materialId,
                  String schemaName, InvoiceType invoiceType) {
        Company company = companyRepository.findBySchemaName(schemaName);
        List<MaterialPriceHistory> materialPriceHistories = materialPriceHistoryRepository
                .findByCustomerIdAndMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(customerId,
                        materialId, company, invoiceType);
        return convertToDto(materialPriceHistories);
    }

    private List<MaterialPriceHistoryDto> convertToDto(List<MaterialPriceHistory> materialPriceHistories) {

        return materialPriceHistories.stream().map(materialPriceHistory -> {
            MaterialPriceHistoryDto materialPriceHistoryDto = new MaterialPriceHistoryDto();
            materialPriceHistoryDto.setId(materialPriceHistory.getId());
            materialPriceHistoryDto.setCompanyId(materialPriceHistory.getCompany().getId());
            materialPriceHistoryDto.setMaterialId(materialPriceHistory.getMaterial().getId());
            materialPriceHistoryDto.setCustomerId(materialPriceHistory.getCustomer().getId());
            materialPriceHistoryDto.setPrice(materialPriceHistory.getPrice());
            materialPriceHistoryDto.setDate(materialPriceHistory.getDate());
            materialPriceHistoryDto.setInvoiceType(materialPriceHistory.getInvoiceType());
            materialPriceHistoryDto.setQuantity(materialPriceHistory.getQuantity());
            materialPriceHistoryDto.setDate(materialPriceHistory.getDate());
            materialPriceHistoryDto.setCustomerName(materialPriceHistory.getCustomer().getName());

            return materialPriceHistoryDto;
        }).collect(Collectors.toList());
    }
}
