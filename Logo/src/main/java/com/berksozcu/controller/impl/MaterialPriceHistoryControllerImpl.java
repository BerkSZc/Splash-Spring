package com.berksozcu.controller.impl;

import com.berksozcu.controller.IMaterialPriceHistoryController;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.service.IMaterialPriceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/history")
public class MaterialPriceHistoryControllerImpl implements IMaterialPriceHistoryController {

    @Autowired
    private IMaterialPriceHistoryService materialPriceHistory;

    @Override
    @GetMapping("/find-by-all-year/{materialId}")
    public List<MaterialPriceHistory> getHistoryAllYear(
            @PathVariable(name = "materialId") Long materialId, @RequestParam InvoiceType invoiceType
  ) {
        return materialPriceHistory.getHistoryAllYear(materialId, invoiceType);
    }

    @Override
    @GetMapping("/find-by-year/{materialId}")
    public List<MaterialPriceHistory> getHistoryByYear(@PathVariable(name = "materialId") Long materialId,
           @RequestParam InvoiceType invoiceType, @RequestParam int year) {
        return materialPriceHistory.getHistoryByYear(materialId, invoiceType, year);
    }

}
