package com.berksozcu.service;

import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IPurchaseInvoiceService {
    PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice, String schemaName);

    PurchaseInvoice editPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice, String schemaName);

    void deletePurchaseInvoice(Long id, String schemaName);

    Page<PurchaseInvoice> getPurchaseInvoiceByDateBetween(int page, int size,
                                                          String search,
                                                          int year, String schemaName);
}
