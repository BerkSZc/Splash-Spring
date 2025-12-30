package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.PaymentCompanyRepository;
import com.berksozcu.service.IPaymentCompanyService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

        if(customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        paymentCompany.setCustomer(customer);

        paymentCompany.setCustomerName(customer.getName());

        paymentCompany.setId(paymentCompany.getId());
        paymentCompany.setDate(paymentCompany.getDate());
        paymentCompany.setComment(paymentCompany.getComment());
        paymentCompany.setPrice(paymentCompany.getPrice());
        paymentCompany.setCustomerName(paymentCompany.getCustomer().getName());

        customer.setBalance(customer.getBalance().add(paymentCompany.getPrice()));

        customerRepository.save(customer);
        paymentCompanyRepository.save(paymentCompany);

        return paymentCompany;
    }

    @Override
    public List<PaymentCompany> getAll() {
        return paymentCompanyRepository.findAll();
    }

    @Override
    @Transactional
    public PaymentCompany editPaymentCompany(Long id, PaymentCompany paymentCompany) {

        PaymentCompany oldPayment = paymentCompanyRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

       Customer oldCustomer = customerRepository.findById(oldPayment.getCustomer().getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        Customer newCustomer = customerRepository.findById(paymentCompany.getCustomer().getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        boolean sameCustomer = oldCustomer.getId().equals(newCustomer.getId());


        if(sameCustomer) {
            BigDecimal fark = paymentCompany.getPrice().subtract(oldPayment.getPrice());
            oldCustomer.setBalance(oldCustomer.getBalance().subtract(fark));
            customerRepository.save(oldCustomer);
        } else {
            oldCustomer.setBalance(oldCustomer.getBalance().add(oldPayment.getPrice()));
            customerRepository.save(oldCustomer);

            newCustomer.setBalance(newCustomer.getBalance().subtract(paymentCompany.getPrice()));
            customerRepository.save(newCustomer);
        }

       oldPayment.setDate(paymentCompany.getDate());
       oldPayment.setComment(paymentCompany.getComment());
       oldPayment.setPrice(paymentCompany.getPrice());
       oldPayment.setCustomer(newCustomer);


        return paymentCompanyRepository.save(oldPayment);
    }

    @Override
    @Transactional
    public void deletePaymentCompany(Long id) {
        PaymentCompany paymentCompany = paymentCompanyRepository.findById(id).orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));
        Customer customer = paymentCompany.getCustomer();
        customer.setBalance(customer.getBalance().subtract(paymentCompany.getPrice()));
        customerRepository.save(customer);
        paymentCompanyRepository.deleteById(id);
    }

    @Override
    public List<PaymentCompany> getPaymentCollectionsByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12,31);
        return paymentCompanyRepository.findByDateBetween(start, end);
    }
}
