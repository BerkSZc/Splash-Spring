package com.berksozcu.service.impl;

import com.berksozcu.entites.material.Material;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.service.IMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MaterialServiceImpl implements IMaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Override
    public Material addMaterial(Material newMaterial) {

        if(materialRepository.existsByCode(newMaterial.getCode())) {
            throw new BaseException(new ErrorMessage(MessageType.MALZEME_KODU_MEVCUT));
        }

        Material material = new Material();
        material.setId(newMaterial.getId());
        material.setCode(newMaterial.getCode());
        material.setComment(newMaterial.getComment());
        material.setUnit(newMaterial.getUnit());
        material.setPurchasePrice(newMaterial.getPurchasePrice());
        material.setSalesPrice(newMaterial.getSalesPrice());
        material.setPurchaseCurrency(newMaterial.getPurchaseCurrency());
        material.setSalesCurrency(newMaterial.getSalesCurrency());

        return materialRepository.save(material);
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

            if(materialRepository.existsByCode(updateMaterial.getCode())
                    && !updateMaterial.getCode().equals(existingMaterial.getCode()))  {
                throw new BaseException(new ErrorMessage(MessageType.MALZEME_KODU_MEVCUT));
            }
           existingMaterial.setComment(updateMaterial.getComment());
           existingMaterial.setCode(updateMaterial.getCode());
           existingMaterial.setUnit(updateMaterial.getUnit());
           existingMaterial.setPurchaseCurrency(updateMaterial.getPurchaseCurrency());
           existingMaterial.setSalesCurrency(updateMaterial.getSalesCurrency());
           existingMaterial.setPurchasePrice(updateMaterial.getPurchasePrice());
           existingMaterial.setSalesPrice(updateMaterial.getSalesPrice());
           materialRepository.save(existingMaterial);
       }
    }

