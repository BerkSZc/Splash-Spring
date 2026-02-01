package com.berksozcu.controller;

import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface IPurchaseInvoiceController {
    public PurchaseInvoice addPurchaseInvoice( Long id, PurchaseInvoice newPurchaseInvoice);
    public List<PurchaseInvoice> findAllPurchaseInvoiceByCustomerId(@PathVariable(name = "id") Long id);
    public List<PurchaseInvoice> getAllPurchaseInvoice();
    public PurchaseInvoice editPurchaseInvoice(@PathVariable(name = "id") Long id, @RequestBody PurchaseInvoice newPurchaseInvoice);
    public void deletePurchaseInvoice(@PathVariable(name = "id") Long id);
    public List<PurchaseInvoice> getPurchaseInvoiceByYear(@PathVariable int year);
}
