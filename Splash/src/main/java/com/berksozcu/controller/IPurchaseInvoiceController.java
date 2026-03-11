package com.berksozcu.controller;

import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IPurchaseInvoiceController {
    PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice, String schemaName);

    List<PurchaseInvoice> findAllPurchaseInvoiceByCustomerId(Long id);

    List<PurchaseInvoice> getAllPurchaseInvoice();

    PurchaseInvoice editPurchaseInvoice(Long id
            , PurchaseInvoice newPurchaseInvoice, String schemaName);

    void deletePurchaseInvoice(Long id, String schemaName);

    Page<PurchaseInvoice> getPurchaseInvoiceByYear(int page, int size, int year,
                                                   String schemaName);
}
