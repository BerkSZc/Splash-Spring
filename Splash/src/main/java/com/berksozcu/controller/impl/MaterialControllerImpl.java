package com.berksozcu.controller.impl;

import com.berksozcu.controller.IMaterialController;
import com.berksozcu.entites.material.Material;
import com.berksozcu.service.IMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/material")
public class MaterialControllerImpl implements IMaterialController {

    @Autowired
    private IMaterialService materialService;

    @Override
    @PostMapping("/add-material")
    public Material addMaterial(@RequestBody Material newMaterial, @RequestParam String schemaName) {
        return materialService.addMaterial(newMaterial, schemaName);
    }

    @Override
    @GetMapping("/list")
    public List<Material> getAllMaterials() {
        return materialService.getAllMaterials();
    }

    @Override
    @PutMapping("/update-material/{id}")
    public void updateMaterial(@PathVariable(name = "id") Long id, @RequestBody Material updateMaterial,
                               @RequestParam String schemaName) {
        materialService.updateMaterial(id, updateMaterial, schemaName);
    }

    @Override
    @DeleteMapping("/delete-material/{id}")
    public void deleteMaterial(@PathVariable(name = "id") Long id, @RequestParam String schemaName) {
        materialService.deleteMaterial(id, schemaName);
    }

    @Override
    @PostMapping("/archive-material")
    public void archiveMaterial(@RequestBody List<Long> ids, @RequestParam boolean archived,
    @RequestParam String schemaName) {
        materialService.archiveMaterial(ids, archived, schemaName);
    }
}
