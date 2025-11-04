package com.berksozcu.service.impl;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.Material;
import com.berksozcu.entites.PurchaseInvoice;
import com.berksozcu.entites.PurchaseInvoiceItem;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.ICustomerService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements ICustomerService {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Override
    public Customer findCustomerById(Long id) {
        Optional<Customer> optional = customerRepository.findById(id);
        if (optional.isEmpty()) {
            return null;
        }
        Customer customer = new Customer();
        customer.setId(optional.get().getId());
        customer.setName(optional.get().getName());
        customer.setBalance(optional.get().getBalance());

        return customer;
    }




    @Override
    public Customer addCustomer(Customer newCustomer) {
        Customer customer = new Customer();
        customer.setId(newCustomer.getId());
        customer.setName(newCustomer.getName());
        customer.setBalance(newCustomer.getBalance());
        customer.setCountry(newCustomer.getCountry());
        customer.setAddress(newCustomer.getAddress());
        customer.setDistrict(newCustomer.getDistrict());
        customer.setLocal(newCustomer.getLocal());
        customer.setVdNo(newCustomer.getVdNo());

        return customerRepository.save(customer);
    }

    @Override
    public List<Customer> getAllCustomer() {
        return customerRepository.findAll();
    }

    @Override
    public void updateCustomer(Long id, Customer updateCustomer) {
        Optional<Customer> optional = customerRepository.findById(id);
        if(optional.isPresent()) {
            optional.get().setName(updateCustomer.getName());
        }
    }


}
