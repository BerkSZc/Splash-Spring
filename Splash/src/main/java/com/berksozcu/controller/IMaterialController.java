package com.berksozcu.controller;

import com.berksozcu.entites.material.Material;

import java.util.List;

public interface IMaterialController{
    public Material addMaterial (Material newMaterial);

    public List<Material> getAllMaterials();

    public void updateMaterial(Long id, Material updateMaterial);
}
