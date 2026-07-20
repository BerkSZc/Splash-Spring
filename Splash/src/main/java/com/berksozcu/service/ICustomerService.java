package com.berksozcu.service;

import com.berksozcu.dto.customer.CustomerDto;
import com.berksozcu.entites.customer.Customer;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICustomerService {

     CustomerDto addCustomer(CustomerDto newCustomer, int year, String schemaName);

     Page<CustomerDto> getAllCustomer(int page, int size, Boolean archived, String search, String schemaName, int year);

     CustomerDto updateCustomer(Long id, CustomerDto updateCustomer, int currentYear, String schemaName);

    List<Customer> findByArchivedTrue();

    List<Customer> findByArchivedFalse();

    void setArchived(List<Long> ids, boolean archived, String schemaName);
}
