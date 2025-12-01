package com.berksozcu.service.impl;

import com.berksozcu.entites.Customer;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.ICustomerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Customer findCustomerById(Long id) {
        Optional<Customer> optional = customerRepository.findById(id);
        if (optional.isEmpty()) {
            throw new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI));
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
        modelMapper.map(newCustomer, customer);

        return customerRepository.save(customer);
    }

    @Override
    public List<Customer> getAllCustomer() {
        return customerRepository.findAll();
    }

    @Override
    public void updateCustomer(Long id, Customer updateCustomer) {
        Optional<Customer> optional = customerRepository.findById(id);
        if (optional.isEmpty()) {
            throw new RuntimeException("Müşteri bulunamadı");
        }

        Customer customer = optional.get();

        modelMapper.map(updateCustomer, customer);
        customerRepository.save(customer);
    }
}
