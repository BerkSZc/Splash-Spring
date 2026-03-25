package com.berksozcu.controller;

import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.domain.Page;


public interface IPurchaseInvoiceController {
    PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice, String schemaName);

    PurchaseInvoice editPurchaseInvoice(Long id
            , PurchaseInvoice newPurchaseInvoice, String schemaName);

    void deletePurchaseInvoice(Long id, String schemaName);

    Page<PurchaseInvoice> getPurchaseInvoiceByYear(int page, int size, String search, int year,
                                                   String schemaName);
}
