package com.berksozcu.service;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;

import java.time.LocalDate;
import java.util.List;

public interface IOpeningVoucherService {
     OpeningVoucher calculateAndSetOpeningVoucher(Customer customer, int targetYear, String schemaName);
     void transferAllCustomers(int targetYear, String schemaName);
     List<OpeningVoucher> getAllOpeningVoucherByCustomer(LocalDate date);
     OpeningVoucher getOpeningVoucherByCustomer(Long customerId, LocalDate date);

}
