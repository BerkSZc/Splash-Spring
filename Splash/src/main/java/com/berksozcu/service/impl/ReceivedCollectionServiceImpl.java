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
import java.util.Objects;

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

        receivedCollection.setComment(Objects.requireNonNullElse(receivedCollection.getComment(), ""));
        receivedCollection.setDate(Objects.requireNonNullElse(receivedCollection.getDate(), LocalDate.now()));
        receivedCollection.setPrice(safeGet(receivedCollection.getPrice()));
        receivedCollection.setFileNo(Objects.requireNonNullElse(receivedCollection.getFileNo(), "").toUpperCase());
        receivedCollection.setCustomer(customer);
        receivedCollection.setCustomerName(Objects.requireNonNullElse(customer.getName(), "").toUpperCase());
        receivedCollection.setCompany(company);

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(safeGet(receivedCollection.getPrice())));
        voucher.setCredit(safeGet(voucher.getCredit()).add(safeGet(receivedCollection.getPrice())));

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

        oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).add(safeGet(oldCollection.getPrice())));
        oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldCollection.getPrice())));

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(newCustomer.getId(), start, end)
                        .orElseGet(() -> getDefaultVoucher(newCustomer, company, start));

        newVoucher.setFinalBalance(safeGet(newVoucher.getFinalBalance()).subtract(safeGet(receivedCollection.getPrice())));
        newVoucher.setCredit(safeGet(oldVoucher.getCredit()).add(safeGet(receivedCollection.getPrice())));

        oldCollection.setDate(Objects.requireNonNullElse(receivedCollection.getDate(), LocalDate.now()));
        oldCollection.setPrice(safeGet(receivedCollection.getPrice()));
        oldCollection.setComment(Objects.requireNonNullElse(receivedCollection.getComment(), ""));
        oldCollection.setCustomer(newCustomer);
        oldCollection.setFileNo(Objects.requireNonNullElse(receivedCollection.getFileNo(), "").toUpperCase());
        oldCollection.setCompany(company);
        oldCollection.setCustomerName(Objects.requireNonNullElse(receivedCollection.getCustomerName(), "").toUpperCase());

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

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(safeGet(receivedCollection.getPrice())));
        voucher.setCredit(safeGet(voucher.getCredit()).subtract(safeGet(receivedCollection.getPrice())));

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
        voucher.setDate(Objects.requireNonNullElse(start, LocalDate.now()));
        voucher.setCustomer(newCustomer);
        voucher.setFileNo("001");
        voucher.setCustomerName(Objects.requireNonNullElse(newCustomer.getName(), ""));
        voucher.setFinalBalance(BigDecimal.ZERO);
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setYearlyCredit(BigDecimal.ZERO);
        voucher.setYearlyDebit(BigDecimal.ZERO);
       return openingVoucherRepository.save(voucher);
    }

    private BigDecimal safeGet(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}

