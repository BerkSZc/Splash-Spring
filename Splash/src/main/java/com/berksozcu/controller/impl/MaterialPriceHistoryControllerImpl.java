package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.dto.material_price_history.MaterialPriceHistoryDto;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.service.IMaterialPriceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/rest/api/history")
@RateLimit(capacity = 5000)
public class MaterialPriceHistoryControllerImpl {

    @Autowired
    private IMaterialPriceHistoryService materialPriceHistory;

    @GetMapping("/find-by-all-year/{materialId}")
    public Page<MaterialPriceHistoryDto> getHistoryAllYear(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @PathVariable(name = "materialId") Long materialId,
            @RequestParam String schemaName,
            @RequestParam InvoiceType invoiceType
  ) {
        return materialPriceHistory.getHistoryAllYear(page, size, search, materialId, schemaName, invoiceType);
    }

    @GetMapping("/find-by-year/{materialId}")
    public Page<MaterialPriceHistoryDto> getHistoryByYear(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @PathVariable(name = "materialId") Long materialId,
           @RequestParam InvoiceType invoiceType,
            @RequestParam String schemaName,
            @RequestParam int year) {
        return materialPriceHistory.getHistoryByYear(page, size, search, materialId, invoiceType, schemaName, year);
    }

    @GetMapping("/find-by-customer-year/{customerId}/{materialId}")
    public Page<MaterialPriceHistoryDto> getHistoryByCustomerAndYear(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @PathVariable(name = "customerId") Long customerId,
            @PathVariable(name = "materialId") Long materialId,
           @RequestParam InvoiceType invoiceType,
            @RequestParam String schemaName,
            @RequestParam int year) {
        return materialPriceHistory.getHistoryByCustomerAndYear(page, size, search, customerId, materialId, invoiceType, schemaName, year);
    }

    @GetMapping("/find-by-customer-all-year/{customerId}/{materialId}")
    public Page<MaterialPriceHistoryDto> getHistoryByCustomerAndAllYear(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @PathVariable(name = "customerId") Long customerId,
            @PathVariable(name = "materialId") Long materialId,
           @RequestParam String schemaName,
           @RequestParam InvoiceType invoiceType) {
        return materialPriceHistory.getHistoryByCustomerAndAllYear(page, size, search, customerId, materialId, schemaName, invoiceType);
    }
}
