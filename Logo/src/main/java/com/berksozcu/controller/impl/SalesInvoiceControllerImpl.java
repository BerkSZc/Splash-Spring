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
    public SalesInvoice addSalesInvoice(@PathVariable(name = "id") Long id, @RequestBody SalesInvoice salesInvoice) {
        return salesInvoiceService.addSalesInvoice(id, salesInvoice);
    }

    @Override
    @GetMapping("/all")
    public List<SalesInvoice> getAllSalesInvoice() {
        return salesInvoiceService.getAllSalesInvoice();
    }

    @Override
    @PutMapping("/update/{id}")
    public SalesInvoice editSalesInvoice(@PathVariable(name = "id") Long id, @RequestBody SalesInvoice salesInvoice) {
            return salesInvoiceService.editSalesInvoice(id, salesInvoice);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deleteSalesInvoice(@PathVariable(name = "id") Long id) {
        salesInvoiceService.deleteSalesInvoice(id);
    }

    @Override
    @GetMapping("/find-date/{year}")
    public List<SalesInvoice> getSalesInvoiceByYear(@PathVariable(name = "year") int year) {
        return salesInvoiceService.getSalesInvoicesByYear(year);
    }
}
