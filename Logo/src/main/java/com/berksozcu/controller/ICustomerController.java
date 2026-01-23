package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.customer.Customer;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface ICustomerController {
     RootEntity<Customer> findCustomerById(Long id);
     RootEntity<Customer> addCustomer(Customer customer);
     RootEntity<List<Customer>> getAllCustomer();
     void updateCustomer(Long id, DtoCustomer updateCustomer, int currentYear);
     void setArchived(@RequestBody List<Long> ids, @RequestParam boolean archived);
}
