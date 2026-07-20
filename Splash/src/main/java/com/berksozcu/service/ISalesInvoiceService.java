package com.berksozcu.service;

import com.berksozcu.dto.invoice.InvoiceDto;
import com.berksozcu.entites.sales.SalesInvoice;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ISalesInvoiceService {
     InvoiceDto addSalesInvoice(Long id, InvoiceDto salesInvoice, String schemaName);
    InvoiceDto editSalesInvoice( Long id, InvoiceDto salesInvoice, String schemaName);
     void deleteSalesInvoice(Long id, String schemaName);
     Page<InvoiceDto> getSalesInvoicesByYear(int page, int size, String search, int year, String schemaName);
}
