package com.berksozcu.service;

import com.berksozcu.dto.customer.OpeningVoucherDto;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;

import java.time.LocalDate;
import java.util.List;

public interface IOpeningVoucherService {
     void transferAllCustomers(int targetYear, String schemaName);
     List<OpeningVoucherDto> getAllOpeningVoucherByCustomer(LocalDate date, String schemaName);
     OpeningVoucherDto getOpeningVoucherByCustomer(Long customerId, LocalDate date, String schemaName);

}
