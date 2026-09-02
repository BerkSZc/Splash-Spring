package com.berksozcu.service;

import com.berksozcu.dto.invoice.InvoiceDto;
import com.berksozcu.entites.material_price_history.InvoiceType;
import org.springframework.data.domain.Page;

public interface IInvoiceService {
    InvoiceDto addInvoice(Long id, InvoiceDto newPurchaseInvoice, String schemaName);

    InvoiceDto editInvoice(Long id, InvoiceDto newPurchaseInvoice, String schemaName);

    void deleteInvoice(Long id, String schemaName, InvoiceType invoiceType);

    Page<InvoiceDto> getInvoicesByDateBetween(int page, int size,
                                              String sortDirection,
                                                          String search,
                                                          int year, String schemaName,
                                              InvoiceType invoiceType);

    public Page<InvoiceDto> getAllInvoicesByCustomerId(int page, int size, String search, Long customerId,
                                                             String schemaName, InvoiceType invoiceType);
}
