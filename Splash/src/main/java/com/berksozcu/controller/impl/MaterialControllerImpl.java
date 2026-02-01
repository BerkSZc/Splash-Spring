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
    public Material addMaterial(@RequestBody Material newMaterial) {
        return materialService.addMaterial(newMaterial);
    }

    @Override
    @GetMapping("/list")
    public List<Material> getAllMaterials() {
        return materialService.getAllMaterials();
    }

    @Override
    @PutMapping("/update-material/{id}")
    public void updateMaterial(@PathVariable(name = "id") Long id, @RequestBody Material updateMaterial) {
        materialService.updateMaterial(id, updateMaterial);
    }


}
