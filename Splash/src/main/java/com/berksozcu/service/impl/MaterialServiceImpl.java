package com.berksozcu.service.impl;

import com.berksozcu.entites.material.Currency;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material.MaterialUnit;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.service.IMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
public class MaterialServiceImpl implements IMaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Override
    public Material addMaterial(Material newMaterial) {

        String code = newMaterial.getCode() != null ? newMaterial.getCode().trim().toUpperCase() : "";
        if (materialRepository.existsByCode(code)) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KODU_MEVCUT));
        }

        newMaterial.setCode(code.toUpperCase());
        newMaterial.setComment(Objects.requireNonNullElse(newMaterial.getComment(), "").toUpperCase());
        newMaterial.setUnit(Objects.requireNonNullElse(newMaterial.getUnit(), MaterialUnit.KG));
        newMaterial.setPurchasePrice(safePrice(newMaterial.getPurchasePrice()));
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
    public void updateMaterial(Long id, Material updateMaterial) {
        Material existingMaterial = materialRepository.findById(id)
                .orElseThrow(() ->
                        new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

        String code = updateMaterial.getCode() != null ? updateMaterial.getCode().trim().toUpperCase() : "";

        if (materialRepository.existsByCode(code)
                && !updateMaterial.getCode().equals(existingMaterial.getCode())) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KODU_MEVCUT));
        }
        existingMaterial.setCode(code.toUpperCase());
        existingMaterial.setComment(Objects.requireNonNullElse(updateMaterial.getComment(), "").toUpperCase());
        existingMaterial.setUnit(Objects.requireNonNullElse(updateMaterial.getUnit(), MaterialUnit.ADET));
        existingMaterial.setPurchaseCurrency(Objects.requireNonNullElse(updateMaterial.getPurchaseCurrency(), Currency.TRY));
        existingMaterial.setSalesCurrency(Objects.requireNonNullElse(updateMaterial.getSalesCurrency(), Currency.TRY));
        existingMaterial.setPurchasePrice(safePrice(updateMaterial.getPurchasePrice()));
        existingMaterial.setSalesPrice(safePrice(updateMaterial.getSalesPrice()));
        materialRepository.save(existingMaterial);
    }

    private BigDecimal safePrice(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
