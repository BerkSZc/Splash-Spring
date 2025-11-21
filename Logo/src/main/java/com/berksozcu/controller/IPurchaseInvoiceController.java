package com.berksozcu.controller;

import com.berksozcu.entites.PurchaseInvoice;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface IPurchaseInvoiceController {
    public PurchaseInvoice addPurchaseInvoice( Long id, PurchaseInvoice newPurchaseInvoice);
    public List<PurchaseInvoice> findAllPurchaseInvoiceByCustomerId(@PathVariable(name = "id") Long id);
    public List<PurchaseInvoice> getAllPurchaseInvoice();
}
