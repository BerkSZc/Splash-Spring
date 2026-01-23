package com.berksozcu.service;

import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.customer.Customer;

import java.util.List;

public interface ICustomerService {
    Customer findCustomerById(Long id);

     Customer addCustomer(DtoCustomer newCustomer, int year);

    List<Customer> getAllCustomer();

     void updateCustomer(Long id, DtoCustomer updateCustomer, int currentYear);

    List<Customer> findByArchivedTrue();

    List<Customer> findByArchivedFalse();

    void setArchived(List<Long> ids, boolean archived);
}
