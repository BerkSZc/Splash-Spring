package com.berksozcu.controller;

import com.berksozcu.dto.invoice.InvoiceDto;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.domain.Page;


public interface IPurchaseInvoiceController {
    InvoiceDto addPurchaseInvoice(Long id, InvoiceDto newPurchaseInvoice, String schemaName);

    InvoiceDto editPurchaseInvoice(Long id
            , InvoiceDto newPurchaseInvoice, String schemaName);

    void deletePurchaseInvoice(Long id, String schemaName);

    Page<InvoiceDto> getPurchaseInvoiceByYear(int page, int size, String search, int year,
                                                   String schemaName);
}
