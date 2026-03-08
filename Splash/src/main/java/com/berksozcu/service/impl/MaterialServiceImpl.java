package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material.Currency;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material.MaterialUnit;
import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import com.berksozcu.entites.sales.SalesInvoiceItem;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.IMaterialService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
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
    public Material addMaterial(Material newMaterial, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        String code = newMaterial.getCode() != null ? newMaterial.getCode().trim().toUpperCase() : "";
        if (materialRepository.existsByCodeAndCompany(code, company)) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KODU_MEVCUT));
        }

        newMaterial.setCode(code.toUpperCase());
        newMaterial.setComment(Objects.requireNonNullElse(newMaterial.getComment(), "").toUpperCase());
        newMaterial.setUnit(Objects.requireNonNullElse(newMaterial.getUnit(), MaterialUnit.KG));
        newMaterial.setPurchasePrice(safePrice(newMaterial.getPurchasePrice()));
        newMaterial.setCompany(company);
        newMaterial.setSalesPrice(safePrice(newMaterial.getSalesPrice()));
        newMaterial.setPurchaseCurrency(Objects.requireNonNullElse(newMaterial.getPurchaseCurrency(), Currency.TRY));
        newMaterial.setSalesCurrency(Objects.requireNonNullElse(newMaterial.getSalesCurrency(), Currency.TRY));
        return materialRepository.save(newMaterial);
    }

    @Override
    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    @Override
    @Transactional
    public void updateMaterial(Long id, Material updateMaterial, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Material existingMaterial = materialRepository.findById(id)
                .orElseThrow(() ->
                        new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

        String code = updateMaterial.getCode() != null ? updateMaterial.getCode().trim().toUpperCase() : "";

        if (materialRepository.existsByCodeAndCompany(code, company)
                && !updateMaterial.getCode().equals(existingMaterial.getCode())) {
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

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

        if (!material.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        if (salesInvoiceItemRepository.existsByMaterialIdAndCompany(id, company) ||
                purchaseInvoiceItemRepository.existsByMaterialIdAndCompany(id, company)) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KULLANIMDA));
        }

        materialPriceHistoryRepository.deleteByMaterialId(material.getId());

        materialRepository.deleteById(id);
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
