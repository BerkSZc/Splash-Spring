package com.berksozcu.service;

import com.berksozcu.entites.SalesInvoice;

import java.util.List;

public interface ISalesInvoiceService {
    public SalesInvoice addSalesInvoice(Long id, SalesInvoice salesInvoice);
    public List<SalesInvoice> getAllSalesInvoice();
    public SalesInvoice editSalesInvoice( Long id, SalesInvoice salesInvoice);
    public void deleteSalesInvoice(Long id);
}
