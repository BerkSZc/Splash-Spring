package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.IMaterialPriceHistoryController;
import com.berksozcu.dto.material_price_history.MaterialPriceHistoryDto;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.service.IMaterialPriceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/history")
@RateLimit(capacity = 5000)
public class MaterialPriceHistoryControllerImpl implements IMaterialPriceHistoryController {

    @Autowired
    private IMaterialPriceHistoryService materialPriceHistory;

    @Override
    @GetMapping("/find-by-all-year/{materialId}")
    public List<MaterialPriceHistoryDto> getHistoryAllYear(
            @PathVariable(name = "materialId") Long materialId, @RequestParam String schemaName,
            @RequestParam InvoiceType invoiceType
  ) {
        return materialPriceHistory.getHistoryAllYear(materialId, schemaName, invoiceType);
    }

    @Override
    @GetMapping("/find-by-year/{materialId}")
    public List<MaterialPriceHistoryDto> getHistoryByYear(@PathVariable(name = "materialId") Long materialId,
           @RequestParam InvoiceType invoiceType, @RequestParam String schemaName, @RequestParam int year) {
        return materialPriceHistory.getHistoryByYear(materialId, invoiceType, schemaName,year);
    }

    @Override
    @GetMapping("/find-by-customer-year/{customerId}/{materialId}")
    public List<MaterialPriceHistoryDto> getHistoryByCustomerAndYear(
            @PathVariable(name = "customerId") Long customerId,
            @PathVariable(name = "materialId") Long materialId,
           @RequestParam InvoiceType invoiceType,
            @RequestParam String schemaName,
            @RequestParam int year) {
        return materialPriceHistory.getHistoryByCustomerAndYear(customerId, materialId, invoiceType, schemaName, year);
    }

    @Override
    @GetMapping("/find-by-customer-all-year/{customerId}/{materialId}")
    public List<MaterialPriceHistoryDto> getHistoryByCustomerAndAllYear(
            @PathVariable(name = "customerId") Long customerId,
            @PathVariable(name = "materialId") Long materialId,
           @RequestParam String schemaName,
           @RequestParam InvoiceType invoiceType) {
        return materialPriceHistory.getHistoryByCustomerAndAllYear(customerId, materialId, schemaName, invoiceType);
    }
}
