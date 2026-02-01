package com.berksozcu.service;

import com.berksozcu.entites.sales.SalesInvoice;

import java.util.List;

public interface ISalesInvoiceService {
    public SalesInvoice addSalesInvoice(Long id, SalesInvoice salesInvoice);
    public List<SalesInvoice> getAllSalesInvoice();
    public SalesInvoice editSalesInvoice( Long id, SalesInvoice salesInvoice);
    public void deleteSalesInvoice(Long id);
    public List<SalesInvoice> getSalesInvoicesByYear(int year);
}
