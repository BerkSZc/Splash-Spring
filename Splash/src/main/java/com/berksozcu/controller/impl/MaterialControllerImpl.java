package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.IMaterialController;
import com.berksozcu.dto.material.MaterialDto;
import com.berksozcu.entites.material.Material;
import com.berksozcu.service.IMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/material")
@RateLimit(capacity = 5000)
public class MaterialControllerImpl implements IMaterialController {

    @Autowired
    private IMaterialService materialService;

    @Override
    @PostMapping("/add-material")
    public MaterialDto addMaterial(@RequestBody MaterialDto newMaterial, @RequestParam String schemaName) {
        return materialService.addMaterial(newMaterial, schemaName);
    }

    @Override
    @GetMapping("/list")
    public Page<MaterialDto> getAllMaterials(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(required = false) Boolean archived,
                                          @RequestParam String schemaName) {
        return materialService.getAllMaterials(page, size, search, archived, schemaName);
    }

    @Override
    @PutMapping("/update-material/{id}")
    public void updateMaterial(@PathVariable(name = "id") Long id, @RequestBody MaterialDto updateMaterial,
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
