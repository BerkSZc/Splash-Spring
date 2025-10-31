package com.berksozcu.service;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.PurchaseInvoice;

public interface ICustomerService {
    public Customer findCustomerById(Long id);
    public Customer addCustomer(Customer customer);
}
