package com.berksozcu.service;

import com.berksozcu.entites.PurchaseInvoice;

public interface IPurchaseInvoiceService {
    public PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice);
}
