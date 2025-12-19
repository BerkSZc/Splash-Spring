package com.berksozcu.service;

import com.berksozcu.entites.customer.Customer;

import java.util.List;

public interface ICustomerService {
    public Customer findCustomerById(Long id);
    public Customer addCustomer(Customer customer);
    public List<Customer> getAllCustomer();
    public void updateCustomer(Long id, Customer updateCustomer);
    public List<Customer> findByArchivedTrue();
    public List<Customer> findByArchivedFalse();
    public void setArchived(Long id, boolean archived);
}
