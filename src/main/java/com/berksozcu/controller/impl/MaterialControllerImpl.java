package com.berksozcu.controller.impl;

import com.berksozcu.controller.IMaterialController;
import com.berksozcu.entites.Material;
import com.berksozcu.service.IMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
