package com.berksozcu.controller.impl;

import com.berksozcu.controller.ISalesInvoiceController;
import com.berksozcu.entites.SalesInvoice;
import com.berksozcu.service.ISalesInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}
