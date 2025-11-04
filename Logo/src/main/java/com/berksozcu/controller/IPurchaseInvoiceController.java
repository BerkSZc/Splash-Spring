package com.berksozcu.controller;

import com.berksozcu.entites.PurchaseInvoice;

public interface IPurchaseInvoiceController {
    public PurchaseInvoice addPurchaseInvoice( Long id, PurchaseInvoice newPurchaseInvoice);
}
