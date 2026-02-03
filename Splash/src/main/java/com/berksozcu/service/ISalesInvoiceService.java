package com.berksozcu.service;

import com.berksozcu.entites.sales.SalesInvoice;

import java.util.List;

public interface ISalesInvoiceService {
    public SalesInvoice addSalesInvoice(Long id, SalesInvoice salesInvoice, String schemaName);
    public List<SalesInvoice> getAllSalesInvoice();
    public SalesInvoice editSalesInvoice( Long id, SalesInvoice salesInvoice, String schemaName);
    public void deleteSalesInvoice(Long id, String schemaName);
    public List<SalesInvoice> getSalesInvoicesByYear(int year);
}
