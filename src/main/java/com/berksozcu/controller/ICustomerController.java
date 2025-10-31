package com.berksozcu.controller;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.PurchaseInvoice;

public interface ICustomerController {
    public Customer findCustomerById(Long id);
    public Customer addCustomer(Customer customer);

}
