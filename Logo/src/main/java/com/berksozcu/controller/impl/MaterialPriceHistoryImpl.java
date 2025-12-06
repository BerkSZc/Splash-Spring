package com.berksozcu.controller.impl;

import com.berksozcu.entites.InvoiceType;
import com.berksozcu.entites.MaterialPriceHistory;
import com.berksozcu.repository.MaterialPriceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/history")

public class MaterialPriceHistoryImpl {

    @Autowired
    private MaterialPriceHistoryRepository repository;

    @GetMapping("/find-all/{materialId}")
    public List<MaterialPriceHistory> findByMaterialIdOrderByDateDesc(@PathVariable(name ="materialId")
                                                          Long materialId) {
        return  repository.findByMaterialIdOrderByDateDesc(materialId);
    }

    @GetMapping("/find-by-type/{materialId}")
    public List<MaterialPriceHistory> findByMaterialIdAndTypeOrderByDateDesc(
            @PathVariable(name = "materialId") Long materialId, @RequestParam InvoiceType invoiceType
  ) {
        return repository.findByMaterialIdAndInvoiceTypeOrderByDateDesc(materialId, invoiceType);
    }

}
