package com.berksozcu.service;

import com.berksozcu.entites.sales.SalesInvoice;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ISalesInvoiceService {
     SalesInvoice addSalesInvoice(Long id, SalesInvoice salesInvoice, String schemaName);
     SalesInvoice editSalesInvoice( Long id, SalesInvoice salesInvoice, String schemaName);
     void deleteSalesInvoice(Long id, String schemaName);
     Page<SalesInvoice> getSalesInvoicesByYear(int page, int size, String search, int year, String schemaName);
}
