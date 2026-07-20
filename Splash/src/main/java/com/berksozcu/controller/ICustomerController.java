package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.customer.CustomerDto;
import com.berksozcu.entites.customer.Customer;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICustomerController {
    RootEntity<CustomerDto> addCustomer(CustomerDto customer, int year, String schemaName);

     RootEntity<Page<CustomerDto>> getAllCustomer(int page, int size, Boolean archived, String search, String schemaName, int year);

     CustomerDto updateCustomer(Long id, CustomerDto updateCustomer, int currentYear, String schemaName);

     void setArchived(List<Long> ids, boolean archived, String schemaName);
}
