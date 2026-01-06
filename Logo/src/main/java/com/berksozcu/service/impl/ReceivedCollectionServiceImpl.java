package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.collections.ReceivedCollection;
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
import java.time.LocalDate;
import java.util.List;

@Service
public class ReceivedCollectionServiceImpl implements IReceivedCollectionService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;

    @Override
    @Transactional
    public ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection) {

        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        if(customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

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

        Customer customer = oldCollection.getCustomer();

        Customer newCustomer = receivedCollection.getCustomer();

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

    @Override
    @Transactional
    public void deleteReceivedCollection(Long id) {
        ReceivedCollection receivedCollection = receivedCollectionRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.TAHSILAT_BULUNAMADI))
        );
        Customer customer = receivedCollection.getCustomer();
        customer.setBalance(customer.getBalance().add(receivedCollection.getPrice()));
        customerRepository.save(customer);
        receivedCollectionRepository.deleteById(id);
    }

    @Override
    public List<ReceivedCollection> getReceivedCollectionsByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return receivedCollectionRepository.findByDateBetween(start, end);
    }
}

