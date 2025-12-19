package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.entites.customer.Customer;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface ICustomerController {
    public RootEntity<Customer> findCustomerById(Long id);
    public RootEntity<Customer> addCustomer(Customer customer);
    public RootEntity<List<Customer>> getAllCustomer();
    public void updateCustomer(Long id, Customer updateCustomer);
    public void setArchived(@PathVariable(name = "id") Long id, @RequestParam boolean archived);
}
