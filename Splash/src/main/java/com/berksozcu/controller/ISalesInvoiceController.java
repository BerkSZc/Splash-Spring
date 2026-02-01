package com.berksozcu.controller;

import com.berksozcu.entites.sales.SalesInvoice;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface ISalesInvoiceController {
    public SalesInvoice addSalesInvoice(Long id,SalesInvoice salesInvoice);
    public List<SalesInvoice> getAllSalesInvoice();
    public SalesInvoice editSalesInvoice(@PathVariable(name = "id") Long id, @RequestBody SalesInvoice salesInvoice);
    public void deleteSalesInvoice(@PathVariable(name = "id") Long id);
    public List<SalesInvoice> getSalesInvoiceByYear(@PathVariable(name = "year") int year);
}
