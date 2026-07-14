package com.berksozcu.service.impl;

import com.berksozcu.dto.material.MaterialDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material.Currency;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material.MaterialUnit;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.IMaterialService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class MaterialServiceImpl implements IMaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private PurchaseInvoiceItemRepository purchaseInvoiceItemRepository;

    @Autowired
    private SalesInvoiceItemRepository salesInvoiceItemRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Override
    @Transactional
    public MaterialDto addMaterial(MaterialDto newMaterial, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        String code = newMaterial.getCode() != null ? newMaterial.getCode().trim().toUpperCase() : "";
        if (materialRepository.existsByCodeAndCompany(code, company)) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KODU_MEVCUT));
        }

        Material material = new Material();

        material.setCode(code.toUpperCase());
        material.setComment(Objects.requireNonNullElse(newMaterial.getComment(), "").toUpperCase());
        material.setUnit(Objects.requireNonNullElse(newMaterial.getUnit(), MaterialUnit.KG));
        material.setPurchasePrice(safePrice(newMaterial.getPurchasePrice()));
        material.setCompany(company);
        material.setSalesPrice(safePrice(newMaterial.getSalesPrice()));
        material.setPurchaseCurrency(Objects.requireNonNullElse(newMaterial.getPurchaseCurrency(), Currency.TRY));
        material.setSalesCurrency(Objects.requireNonNullElse(newMaterial.getSalesCurrency(), Currency.TRY));
        Material savedMaterial = materialRepository.save(material);

        MaterialDto materialDto = new MaterialDto();
        materialDto.setId(savedMaterial.getId());
        materialDto.setCode(savedMaterial.getCode());
        materialDto.setComment(savedMaterial.getComment());
        materialDto.setUnit(savedMaterial.getUnit());
        materialDto.setPurchasePrice(safePrice(savedMaterial.getPurchasePrice()));
        materialDto.setCompanyId(savedMaterial.getCompany().getId());
        materialDto.setSalesPrice(savedMaterial.getSalesPrice());
        materialDto.setPurchaseCurrency(savedMaterial.getPurchaseCurrency());
        materialDto.setSalesCurrency(savedMaterial.getSalesCurrency());

        return materialDto;
    }

    @Override
    public Page<MaterialDto> getAllMaterials(int page, int size, String search, Boolean archived, String schemName) {
        Company company = companyRepository.findBySchemaName(schemName);
        Pageable pageable = PageRequest.of(page, size, Sort.by("code").ascending());

        String searchParam;
        if (search == null || search.trim().isEmpty()) {
            searchParam = "";
        } else {
            searchParam = "%" + search.toLowerCase(Locale.forLanguageTag("tr-TR")).trim() + "%";
        }

        boolean isArchived = archived != null && archived;

        Page<Material> pageableMaterial = materialRepository.findByCompanyAndArchivedWithSearch(company, isArchived, searchParam, pageable);

        return pageableMaterial.map(material -> {
            MaterialDto materialDto = new MaterialDto();
            materialDto.setId(material.getId());
            materialDto.setCode(material.getCode());
            materialDto.setComment(material.getComment());
            materialDto.setCompanyId(material.getCompany().getId());
            materialDto.setUnit(material.getUnit());
            materialDto.setPurchasePrice(material.getPurchasePrice());
            materialDto.setSalesPrice(material.getSalesPrice());
            materialDto.setPurchaseCurrency(material.getPurchaseCurrency());
            materialDto.setSalesCurrency(material.getSalesCurrency());
            materialDto.setArchived(material.isArchived());
            return materialDto;
        });
    }

    @Override
    @Transactional
    public void updateMaterial(Long id, MaterialDto updateMaterial, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Material existingMaterial = materialRepository.findByIdAndCompany(id, company)
                .orElseThrow(() ->
                        new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

        String code = updateMaterial.getCode() != null ? updateMaterial.getCode().trim().toUpperCase() : "";

        if (materialRepository.existsByCodeAndCompany(code, company)
                && !code.equals(existingMaterial.getCode())) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KODU_MEVCUT));
        }

        if (!existingMaterial.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        existingMaterial.setCode(code.toUpperCase());
        existingMaterial.setComment(Objects.requireNonNullElse(updateMaterial.getComment(), "").toUpperCase());
        existingMaterial.setUnit(Objects.requireNonNullElse(updateMaterial.getUnit(), MaterialUnit.ADET));
        existingMaterial.setPurchaseCurrency(Objects.requireNonNullElse(updateMaterial.getPurchaseCurrency(), Currency.TRY));
        existingMaterial.setSalesCurrency(Objects.requireNonNullElse(updateMaterial.getSalesCurrency(), Currency.TRY));
        existingMaterial.setPurchasePrice(safePrice(updateMaterial.getPurchasePrice()));
        existingMaterial.setCompany(company);
        existingMaterial.setSalesPrice(safePrice(updateMaterial.getSalesPrice()));
        materialRepository.save(existingMaterial);
    }

    @Override
    @Transactional
    public void deleteMaterial(Long id, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Material material = materialRepository.findByIdAndCompany(id, company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

        if (!material.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        if (salesInvoiceItemRepository.existsByMaterialIdAndCompany(id, company) ||
                purchaseInvoiceItemRepository.existsByMaterialIdAndCompany(id, company)) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KULLANIMDA));
        }

        materialPriceHistoryRepository.deleteByMaterialIdAndCompany(material.getId(), company);

        materialRepository.deleteByIdAndCompany(id, company);
    }

    @Override
    @Transactional
    public void archiveMaterial(List<Long> ids, boolean archived, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);
        materialRepository.updateArchivedStatus(ids, archived, company);
    }

    private BigDecimal safePrice(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
