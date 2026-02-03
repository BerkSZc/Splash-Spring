package com.berksozcu.controller.impl;

import com.berksozcu.controller.ISalesInvoiceController;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.service.ISalesInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/sales")
public class SalesInvoiceControllerImpl implements ISalesInvoiceController {

    @Autowired
    private ISalesInvoiceService salesInvoiceService;

    @Override
    @PostMapping("/add/{id}")
    public SalesInvoice addSalesInvoice(@PathVariable(name = "id") Long id, @RequestBody SalesInvoice salesInvoice,
                                        @RequestParam String schemaName) {
        return salesInvoiceService.addSalesInvoice(id, salesInvoice, schemaName);
    }

    @Override
    @GetMapping("/all")
    public List<SalesInvoice> getAllSalesInvoice() {
        return salesInvoiceService.getAllSalesInvoice();
    }

    @Override
    @PutMapping("/update/{id}")
    public SalesInvoice editSalesInvoice(@PathVariable(name = "id") Long id, @RequestBody SalesInvoice salesInvoice,
                                         @RequestParam String schemaName) {
            return salesInvoiceService.editSalesInvoice(id, salesInvoice, schemaName);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deleteSalesInvoice(@PathVariable(name = "id") Long id,
                                   @RequestParam String schemaName) {
        salesInvoiceService.deleteSalesInvoice(id, schemaName);
    }

    @Override
    @GetMapping("/find-year/{year}")
    public List<SalesInvoice> getSalesInvoiceByYear(@PathVariable(name = "year") int year) {
        return salesInvoiceService.getSalesInvoicesByYear(year);
    }
}
