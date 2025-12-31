package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.ICustomerService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
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
        customer.setName(newCustomer.getName());
        customer.setAddress(newCustomer.getAddress());
        customer.setOpeningBalance(newCustomer.getOpeningBalance());
        customer.setCountry(newCustomer.getCountry());
        customer.setCode(newCustomer.getCode());
        customer.setLocal(newCustomer.getLocal());
        customer.setDistrict(newCustomer.getDistrict());
        customer.setVdNo(newCustomer.getVdNo());


        if (customer.getOpeningBalance() != null) {
            customer.setBalance(customer.getOpeningBalance());
        } else {
            customer.setOpeningBalance(BigDecimal.ZERO);
            customer.setBalance(BigDecimal.ZERO);
        }

        return customerRepository.save(customer);
    }

    @Override
    public List<Customer> getAllCustomer() {
        return customerRepository.findAll();
    }

    @Override
    public void updateCustomer(Long id, Customer updateCustomer) {
        Customer oldCustomer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );
        if (oldCustomer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }
        oldCustomer.setName(updateCustomer.getName());
        oldCustomer.setAddress(updateCustomer.getAddress());
        oldCustomer.setLocal(updateCustomer.getLocal());
        oldCustomer.setDistrict(updateCustomer.getDistrict());
        oldCustomer.setVdNo(updateCustomer.getVdNo());
        oldCustomer.setCountry(updateCustomer.getCountry());


        BigDecimal openingDiff = updateCustomer.getOpeningBalance().subtract(oldCustomer.getOpeningBalance());
        oldCustomer.setBalance(oldCustomer.getBalance().add(openingDiff));

        oldCustomer.setOpeningBalance(updateCustomer.getOpeningBalance());

        customerRepository.save(oldCustomer);
    }

    @Override
    public List<Customer> findByArchivedTrue() {
        return customerRepository.findByArchivedTrue();
    }

    @Override
    public List<Customer> findByArchivedFalse() {
        return customerRepository.findByArchivedFalse();
    }

    @Override
    @Transactional
    public void setArchived(List<Long> ids, boolean archived) {
        customerRepository.updateArchivedStatus(ids, archived);
    }
}

