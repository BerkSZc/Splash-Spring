package com.berksozcu.controller;


import com.berksozcu.entites.customer.OpeningVoucher;

import java.time.LocalDate;
import java.util.List;

public interface IOpeningVoucherController {
     String transferAll( int targetYear, String schemaName);
     List<OpeningVoucher> getOpeningVoucherByCustomerAndYear(LocalDate date, String schemaName);
     OpeningVoucher getOpeningVoucherByCustomerAndYear(Long customerId, LocalDate date, String schemaName);
}