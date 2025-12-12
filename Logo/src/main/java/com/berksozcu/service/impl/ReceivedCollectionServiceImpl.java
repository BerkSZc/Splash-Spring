package com.berksozcu.service.impl;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.ReceivedCollection;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.ReceivedCollectionRepository;
import com.berksozcu.service.IReceivedCollectionService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

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
        receivedCollection.setCustomerName(receivedCollection.getCustomer().getName());

        customer.setBalance(customer.getBalance().subtract(receivedCollection.getPrice()));

        receivedCollectionRepository.save(receivedCollection);
        customerRepository.save(customer);

        return receivedCollection;

    }

    @Override
    public List<ReceivedCollection> getAll() {
        return receivedCollectionRepository.findAll();
    }

    @Override
    @Transactional
    public ReceivedCollection editReceivedCollection(Long id, ReceivedCollection receivedCollection) {

        ReceivedCollection oldCollection = receivedCollectionRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.TAHSILAT_BULUNAMADI)));

        Customer customer = customerRepository.findById(oldCollection.getCustomer().getId())
                        .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        Customer newCustomer = customerRepository.findById(receivedCollection.getCustomer().getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        boolean sameCustomer = customer.getId().equals(newCustomer.getId());


        if(sameCustomer) {
            BigDecimal fark = receivedCollection.getPrice().subtract(oldCollection.getPrice());
            customer.setBalance(customer.getBalance().subtract(fark));
            customerRepository.save(customer);
        } else {
            customer.setBalance(customer.getBalance().add(oldCollection.getPrice()));
            customerRepository.save(customer);

            newCustomer.setBalance(newCustomer.getBalance().subtract(receivedCollection.getPrice()));
            customerRepository.save(newCustomer);
        }


        oldCollection.setDate(receivedCollection.getDate());
        oldCollection.setPrice(receivedCollection.getPrice());
        oldCollection.setComment(receivedCollection.getComment());
        oldCollection.setCustomer(newCustomer);

        return receivedCollectionRepository.save(oldCollection);
    }
}
