package com.berksozcu.controller;

import com.berksozcu.entites.material.Material;

import java.util.List;

public interface IMaterialController{
     Material addMaterial (Material newMaterial, String schemaName);

     List<Material> getAllMaterials();

     void updateMaterial(Long id, Material updateMaterial, String schemaName);

     void deleteMaterial(Long id, String schemaName);

     void archiveMaterial (List<Long> ids, boolean archived, String schemaName);
}
