package com.berksozcu.service;

import com.berksozcu.entites.PurchaseInvoice;

import java.util.List;

public interface IPurchaseInvoiceService {
    public PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice);
    public List<PurchaseInvoice> findAllPurchaseInvoiceByCustomerId(Long id);
    public List<PurchaseInvoice> getAllPurchaseInvoice();
    public PurchaseInvoice editPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice);
    public void deletePurchaseInvoice(Long id);
}
