package com.berksozcu.service.impl;

import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
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

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    @Transactional
    public ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection, String schemaName) {

        Customer customer = customerRepository.findById(id).orElseThrow(() ->
                new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        Company company = companyRepository.findBySchemaName(schemaName);

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        if(receivedCollectionRepository.existsByFileNo(receivedCollection.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        LocalDate start = LocalDate.of(receivedCollection.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(receivedCollection.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(receivedCollection.getPrice());
        }

        receivedCollection.setComment(receivedCollection.getComment());
        receivedCollection.setDate(receivedCollection.getDate());
        receivedCollection.setPrice(receivedCollection.getPrice());
        receivedCollection.setFileNo(receivedCollection.getFileNo());
        receivedCollection.setCustomer(customer);
        receivedCollection.setCustomerName(customer.getName());
        receivedCollection.setCompany(company);

        BigDecimal finalBalance = voucher.getFinalBalance() != null ? voucher.getFinalBalance() : BigDecimal.ZERO;
        voucher.setFinalBalance(finalBalance.subtract(receivedCollection.getPrice()));
        voucher.setCredit(voucher.getCredit().add(receivedCollection.getPrice()));

        openingVoucherRepository.save(voucher);
        return receivedCollectionRepository.save(receivedCollection);
    }

    @Override
    public List<ReceivedCollection> getAll() {
        return receivedCollectionRepository.findAll();
    }

    @Override
    @Transactional
    public ReceivedCollection editReceivedCollection(Long id, ReceivedCollection receivedCollection, String schemaName) {

        ReceivedCollection oldCollection = receivedCollectionRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.TAHSILAT_BULUNAMADI)));

        Company company = companyRepository.findBySchemaName(schemaName);

        if(receivedCollectionRepository.existsByFileNo(receivedCollection.getFileNo())
        && !oldCollection.getFileNo().equals(receivedCollection.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        if(!oldCollection.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(receivedCollection.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(receivedCollection.getDate().getYear(), 12, 31);

        Customer newCustomer = receivedCollection.getCustomer();
        Customer oldCustomer = oldCollection.getCustomer();


        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(oldCustomer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(newCustomer, company, start));

        if (oldVoucher.getFinalBalance() == null) {
            oldVoucher.setFinalBalance(BigDecimal.ZERO);
        }

        oldVoucher.setFinalBalance(oldVoucher.getFinalBalance().add(oldCollection.getPrice()));
        oldVoucher.setCredit(oldVoucher.getCredit().subtract(oldCollection.getPrice()));

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(newCustomer.getId(), start, end)
                        .orElseGet(() -> getDefaultVoucher(newCustomer, company, start));

        BigDecimal newFinalBalance = newVoucher.getFinalBalance() != null ? newVoucher.getFinalBalance() : BigDecimal.ZERO;
        newVoucher.setFinalBalance(newFinalBalance.subtract(receivedCollection.getPrice()));
        newVoucher.setCredit(oldVoucher.getCredit().add(receivedCollection.getPrice()));

        oldCollection.setDate(receivedCollection.getDate());
        oldCollection.setPrice(receivedCollection.getPrice());
        oldCollection.setComment(receivedCollection.getComment());
        oldCollection.setCustomer(newCustomer);
        oldCollection.setFileNo(receivedCollection.getFileNo());
        oldCollection.setCompany(company);
        oldCollection.setCustomerName(receivedCollection.getCustomerName());

        openingVoucherRepository.save(newVoucher);
        openingVoucherRepository.save(oldVoucher);

        return receivedCollectionRepository.save(oldCollection);
    }

    @Override
    @Transactional
    public void deleteReceivedCollection(Long id, String schemaName) {
        ReceivedCollection receivedCollection = receivedCollectionRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.TAHSILAT_BULUNAMADI))
        );

        Customer customer = receivedCollection.getCustomer();
        Company company = companyRepository.findBySchemaName(schemaName);

        if(!receivedCollection.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(receivedCollection.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(receivedCollection.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(customer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(receivedCollection.getPrice());
        }

        voucher.setFinalBalance(voucher.getFinalBalance().add(receivedCollection.getPrice()));
        voucher.setCredit(voucher.getCredit().subtract(receivedCollection.getPrice()));

        openingVoucherRepository.save(voucher);
        receivedCollectionRepository.deleteById(id);
    }

    @Override
    public List<ReceivedCollection> getReceivedCollectionsByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return receivedCollectionRepository.findByDateBetween(start, end);
    }

    private OpeningVoucher getDefaultVoucher(Customer newCustomer, Company company, LocalDate start) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDescription("Eklendi");
        voucher.setDate(start);
        voucher.setCustomer(newCustomer);
        voucher.setFileNo("001");
        voucher.setCustomerName(newCustomer.getName());
        voucher.setFinalBalance(BigDecimal.ZERO);
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setYearlyCredit(BigDecimal.ZERO);
        voucher.setYearlyDebit(BigDecimal.ZERO);
       return openingVoucherRepository.save(voucher);
    }
}

