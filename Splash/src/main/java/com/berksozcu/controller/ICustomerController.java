package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.customer.Customer;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICustomerController {
    RootEntity<Customer> addCustomer(DtoCustomer customer, int year, String schemaName);

     RootEntity<Page<Customer>> getAllCustomer(int page, int size, Boolean archived, String search, String schemaName);

     void updateCustomer(Long id, DtoCustomer updateCustomer, int currentYear, String schemaName);

     void setArchived(List<Long> ids, boolean archived, String schemaName);
}
