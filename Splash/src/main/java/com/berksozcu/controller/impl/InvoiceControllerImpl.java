package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.dto.invoice.InvoiceDto;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.service.IInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/api/invoice")
@RateLimit(capacity = 5000)
public class InvoiceControllerImpl {

    @Autowired
    private IInvoiceService invoiceService;


    @PostMapping("/add/{id}")
    public InvoiceDto addPurchaseInvoice(@PathVariable(name = "id") Long id,
                                         @RequestBody InvoiceDto invoice,
                                         @RequestParam String schemaName) {
        return invoiceService.addInvoice(id, invoice, schemaName);
    }

    @PutMapping("/update/{id}")
    public InvoiceDto editPurchaseInvoice(@PathVariable(name = "id") Long id,
                                          @RequestBody InvoiceDto invoice,
                                          @RequestParam String schemaName) {
        return invoiceService.editInvoice(id, invoice, schemaName);
    }

    @DeleteMapping("/delete/{id}")
    public void deletePurchaseInvoice(@PathVariable(name = "id") Long id,
                                      @RequestParam String schemaName,
                                      @RequestParam InvoiceType type) {
        invoiceService.deleteInvoice(id, schemaName, type);
    }

    @GetMapping("/find-by-year")
    public Page<InvoiceDto> getPurchaseInvoiceByYear(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size,
                                                     @RequestParam(defaultValue = "DESC") String sortDirection,
                                                     @RequestParam(required = false) String search,
                                                     @RequestParam int year,
                                                     @RequestParam String schemaName,
                                                     @RequestParam(required = false) InvoiceType type
    ) {
        return invoiceService.getInvoicesByDateBetween(page, size, sortDirection, search, year, schemaName, type);
    }

    @GetMapping("/find-all-invoices/{customerId}")
    public Page<InvoiceDto> getAllInvoicesByCustomerId(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InvoiceType invoiceType,
            @RequestParam String schemaName) {

        return invoiceService.getAllInvoicesByCustomerId(
                page,
                size,
                search,
                customerId,
                schemaName,
                invoiceType
        );
    }
}
