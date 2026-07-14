package com.berksozcu.controller;


import com.berksozcu.dto.customer.OpeningVoucherDto;
import com.berksozcu.entites.customer.OpeningVoucher;

import java.time.LocalDate;
import java.util.List;

public interface IOpeningVoucherController {
     String transferAll( int targetYear, String schemaName);
     List<OpeningVoucherDto> getAllOpeningVoucherByCustomerAndYear(LocalDate date, String schemaName);
     OpeningVoucherDto getOpeningVoucherByCustomerAndYear(Long customerId, LocalDate date, String schemaName);
}