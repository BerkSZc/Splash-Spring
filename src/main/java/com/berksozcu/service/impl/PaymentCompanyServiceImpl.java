package com.berksozcu.service.impl;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.PaymentCompany;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.PaymentCompanyRepository;
import com.berksozcu.service.IPaymentCompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentCompanyServiceImpl implements IPaymentCompanyService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;

    @Override
    public PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany) {
        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new RuntimeException("User not found")
        );

        paymentCompany.setCustomer(customer);

        paymentCompany.setCustomerName(customer.getName());

        paymentCompany.setId(paymentCompany.getId());
        paymentCompany.setDate(paymentCompany.getDate());
        paymentCompany.setComment(paymentCompany.getComment());
        paymentCompany.setPrice(paymentCompany.getPrice());

        customer.setBalance(customer.getBalance().subtract(paymentCompany.getPrice()));

        customerRepository.save(customer);
        paymentCompanyRepository.save(paymentCompany);

        return paymentCompany;
    }
}
