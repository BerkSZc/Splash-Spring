package com.berksozcu.service.impl;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.ReceivedCollection;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.ReceivedCollectionRepository;
import com.berksozcu.service.IReceivedCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReceivedCollectionServiceImpl implements IReceivedCollectionService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;

    @Override
    public ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection) {

        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Customer not found")
        );

        receivedCollection.setCustomer(customer);

        receivedCollection.setId(receivedCollection.getId());
        receivedCollection.setComment(receivedCollection.getComment());
        receivedCollection.setDate(receivedCollection.getDate());
        receivedCollection.setPrice(receivedCollection.getPrice());

        customer.setBalance(customer.getBalance().subtract(receivedCollection.getPrice()));

        receivedCollectionRepository.save(receivedCollection);
        customerRepository.save(customer);

        return receivedCollection;

    }
}
