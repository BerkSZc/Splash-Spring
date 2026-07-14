package com.berksozcu.controller;

import com.berksozcu.dto.material.MaterialDto;
import com.berksozcu.entites.material.Material;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IMaterialController {
    MaterialDto addMaterial(MaterialDto newMaterial, String schemaName);

    Page<MaterialDto> getAllMaterials(int page,
                                   int size,
                                   String search,
                                    Boolean archived,
                                   String schemaName);

    void updateMaterial(Long id, MaterialDto updateMaterial, String schemaName);

    void deleteMaterial(Long id, String schemaName);

    void archiveMaterial(List<Long> ids, boolean archived, String schemaName);
}
