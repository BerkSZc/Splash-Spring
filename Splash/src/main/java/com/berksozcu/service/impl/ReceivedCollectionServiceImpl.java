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

        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
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
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(customer.getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(receivedCollection.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(receivedCollection.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(receivedCollection.getPrice());
        }

        receivedCollection.setCustomer(customer);

        receivedCollection.setId(receivedCollection.getId());
        receivedCollection.setComment(receivedCollection.getComment());
        receivedCollection.setDate(receivedCollection.getDate());
        receivedCollection.setPrice(receivedCollection.getPrice());
        receivedCollection.setCustomerName(receivedCollection.getCustomer().getName());
        receivedCollection.setFileNo(receivedCollection.getFileNo());
        receivedCollection.setCompany(company);

        voucher.setFinalBalance(voucher.getFinalBalance().subtract(receivedCollection.getPrice()));
        voucher.setCredit(voucher.getCredit().add(receivedCollection.getPrice()));
        openingVoucherRepository.save(voucher);
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


        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(receivedCollection.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(receivedCollection.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(receivedCollection.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(receivedCollection.getPrice());
        }

        Customer customer = oldCollection.getCustomer();

        Customer newCustomer = receivedCollection.getCustomer();

        boolean sameCustomer = customer.getId().equals(newCustomer.getId());


        if (sameCustomer) {
            BigDecimal fark = receivedCollection.getPrice().subtract(oldCollection.getPrice());
            voucher.setFinalBalance(voucher.getFinalBalance().subtract(fark));
            voucher.setCredit(voucher.getCredit().add(fark));
            customerRepository.save(customer);
        } else {
            voucher.setFinalBalance(voucher.getFinalBalance().add(oldCollection.getPrice()));
            voucher.setCredit(voucher.getCredit().subtract(oldCollection.getPrice()));
            customerRepository.save(customer);

            voucher.setCredit(voucher.getCredit().add(oldCollection.getPrice()));
            voucher.setFinalBalance(voucher.getFinalBalance().subtract(receivedCollection.getPrice()));
            customerRepository.save(newCustomer);
        }


        oldCollection.setDate(receivedCollection.getDate());
        oldCollection.setPrice(receivedCollection.getPrice());
        oldCollection.setComment(receivedCollection.getComment());
        oldCollection.setCustomer(newCustomer);
        oldCollection.setFileNo(receivedCollection.getFileNo());

        openingVoucherRepository.save(voucher);

        return receivedCollectionRepository.save(oldCollection);
    }

    @Override
    @Transactional
    public void deleteReceivedCollection(Long id, String schemaName) {
        ReceivedCollection receivedCollection = receivedCollectionRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.TAHSILAT_BULUNAMADI))
        );

        Company company = companyRepository.findBySchemaName(schemaName);

        if(!receivedCollection.getCustomer().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(receivedCollection.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(receivedCollection.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(receivedCollection.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(receivedCollection.getPrice());
                    newVoucher.setDate(LocalDate.of(receivedCollection.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(receivedCollection.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(receivedCollection.getPrice());
        }


        Customer customer = receivedCollection.getCustomer();
        voucher.setFinalBalance(voucher.getFinalBalance().add(receivedCollection.getPrice()));
        voucher.setCredit(voucher.getCredit().subtract(receivedCollection.getPrice()));

        openingVoucherRepository.save(voucher);
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

