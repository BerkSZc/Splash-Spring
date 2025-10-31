package com.berksozcu.service.impl;

import com.berksozcu.entites.Material;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.service.IMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MaterialServiceImpl implements IMaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Override
    public Material addMaterial(Material newMaterial) {
        Material material = new Material();
        material.setId(newMaterial.getId());
        material.setCode(newMaterial.getCode());
        material.setComment(newMaterial.getComment());
        material.setUnit(newMaterial.getUnit());

        return materialRepository.save(material);
    }
}
