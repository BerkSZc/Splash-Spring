package com.berksozcu.controller;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.PurchaseInvoice;

import java.util.List;

public interface ICustomerController {
    public Customer findCustomerById(Long id);
    public Customer addCustomer(Customer customer);
    public List<Customer> getAllCustomer();
    public void updateCustomer(Long id, Customer updateCustomer);
}
