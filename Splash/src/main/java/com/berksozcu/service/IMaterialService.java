package com.berksozcu.service;

import com.berksozcu.entites.material.Material;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IMaterialService {
     Material addMaterial (Material newMaterial, String schemaName);

     Page<Material> getAllMaterials(int page, int size, String search, Boolean archived,String schemName);

     void updateMaterial(Long id, Material updateMaterial, String schemaName);

     void deleteMaterial(Long id, String schemaName);

     void archiveMaterial(List<Long> ids, boolean archived, String schemaName);
}
