package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.entites.Customer;
import com.berksozcu.entites.PurchaseInvoice;

import java.util.List;

public interface ICustomerController {
    public RootEntity<Customer> findCustomerById(Long id);
    public RootEntity<Customer> addCustomer(Customer customer);
    public RootEntity<List<Customer>> getAllCustomer();
    public void updateCustomer(Long id, Customer updateCustomer);
}
