package com.berksozcu.service;

import com.berksozcu.dto.invoice.InvoiceDto;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IPurchaseInvoiceService {
    InvoiceDto addPurchaseInvoice(Long id, InvoiceDto newPurchaseInvoice, String schemaName);

    InvoiceDto editPurchaseInvoice(Long id, InvoiceDto newPurchaseInvoice, String schemaName);

    void deletePurchaseInvoice(Long id, String schemaName);

    Page<InvoiceDto> getPurchaseInvoiceByDateBetween(int page, int size,
                                                          String search,
                                                          int year, String schemaName);
}
