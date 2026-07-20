package com.berksozcu.service.impl;

import com.berksozcu.dto.collection.CollectionDto;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
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
    public CollectionDto addCollection(Long id, CollectionDto collectionDto, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Customer customer = customerRepository.findByIdAndCompany(id, company).orElseThrow(() ->
                new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }
        String fileNo = collectionDto.getFileNo() != null ? collectionDto.getFileNo().trim().toUpperCase() : "";

        if (receivedCollectionRepository.existsByFileNoAndCompany(fileNo, company)) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        LocalDate start = LocalDate.of(collectionDto.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(collectionDto.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        id, company, start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        ReceivedCollection collection = new ReceivedCollection();
        collection.setFileNo(fileNo);
        collection.setComment(Objects.requireNonNullElse(collectionDto.getComment(), ""));
        collection.setDate(Objects.requireNonNullElse(collectionDto.getDate(), LocalDate.now()));
        collection.setPrice(safeGet(collectionDto.getPrice()));
        collection.setFileNo(Objects.requireNonNullElse(collectionDto.getFileNo(), "").toUpperCase());
        collection.setCustomer(customer);
        collection.setCustomerName(Objects.requireNonNullElse(customer.getName(), "").toUpperCase());
        collection.setCompany(company);

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(safeGet(collectionDto.getPrice())));
        voucher.setCredit(safeGet(voucher.getCredit()).add(safeGet(collectionDto.getPrice())));

        openingVoucherRepository.save(voucher);
        ReceivedCollection savedCollection = receivedCollectionRepository.save(collection);

        return convertToDto(savedCollection);
    }

    @Override
    @Transactional
    public CollectionDto editReceivedCollection(Long id, CollectionDto collectionDto, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        ReceivedCollection oldCollection = receivedCollectionRepository.findByIdAndCompany(id, company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.TAHSILAT_BULUNAMADI)));

        String fileNo = collectionDto.getFileNo() != null ? collectionDto.getFileNo().trim().toUpperCase() : "";
        String oldCollectionFileNo = oldCollection.getFileNo().trim().toUpperCase();

        if (receivedCollectionRepository.existsByFileNoAndCompany(fileNo, company)
                && !oldCollectionFileNo.equals(fileNo)) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        if (!oldCollection.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(collectionDto.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(collectionDto.getDate().getYear(), 12, 31);

        LocalDate oldStart = LocalDate.of(oldCollection.getDate().getYear(), 1, 1);
        LocalDate oldEnd = LocalDate.of(oldCollection.getDate().getYear(), 12, 31);

        Customer newCustomer = customerRepository.findByIdAndCompany(collectionDto.getCustomerId(), company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        Customer oldCustomer = oldCollection.getCustomer();

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        oldCustomer.getId(), company, oldStart, oldEnd)
                .orElseGet(() -> getDefaultVoucher(oldCustomer, company, start));

        oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).add(safeGet(oldCollection.getPrice())));
        oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldCollection.getPrice())));

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        newCustomer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(newCustomer, company, start));

        newVoucher.setFinalBalance(safeGet(newVoucher.getFinalBalance()).subtract(safeGet(collectionDto.getPrice())));
        newVoucher.setCredit(safeGet(newVoucher.getCredit()).add(safeGet(collectionDto.getPrice())));

        oldCollection.setDate(Objects.requireNonNullElse(collectionDto.getDate(), LocalDate.now()));
        oldCollection.setPrice(safeGet(collectionDto.getPrice()));
        oldCollection.setComment(Objects.requireNonNullElse(collectionDto.getComment(), ""));
        oldCollection.setCustomer(newCustomer);
        oldCollection.setFileNo(fileNo);
        oldCollection.setCompany(company);
        oldCollection.setCustomerName(Objects.requireNonNullElse(collectionDto.getCustomerName(), "").toUpperCase());

        openingVoucherRepository.save(oldVoucher);
        openingVoucherRepository.save(newVoucher);

        ReceivedCollection savedCollection = receivedCollectionRepository.save(oldCollection);

        return convertToDto(savedCollection);
    }

    @Override
    @Transactional
    public void deleteReceivedCollection(Long id, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        ReceivedCollection receivedCollection = receivedCollectionRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.TAHSILAT_BULUNAMADI))
        );

        Customer customer = receivedCollection.getCustomer();

        if (!receivedCollection.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(receivedCollection.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(receivedCollection.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        customer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(safeGet(receivedCollection.getPrice())));
        voucher.setCredit(safeGet(voucher.getCredit()).subtract(safeGet(receivedCollection.getPrice())));

        openingVoucherRepository.save(voucher);
        receivedCollectionRepository.deleteById(id);
    }

    @Override
    public Page<CollectionDto> getReceivedCollectionsByYear(int page, int size, String search, int year,
                                                            String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        String searchParam;
        if (search == null || search.trim().isEmpty()) {
            searchParam = "";
        } else {
            searchParam = "%" + search.toLowerCase(Locale.forLanguageTag("tr-TR")).trim() + "%";
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());

        Page<ReceivedCollection> pageableCollections = receivedCollectionRepository
                .findByCompanyAndSearchAndDateBetween(company, searchParam, start, end, pageable);

        return pageableCollections.map(this::convertToDto);
    }

    private CollectionDto convertToDto(ReceivedCollection receivedCollection) {
        CollectionDto collectionDto = new CollectionDto();
        collectionDto.setId(receivedCollection.getId());
        collectionDto.setFileNo(receivedCollection.getFileNo());
        collectionDto.setCustomerName(receivedCollection.getCustomerName());
        collectionDto.setDate(receivedCollection.getDate());
        collectionDto.setCompanyId(receivedCollection.getCompany().getId());
        collectionDto.setComment(receivedCollection.getComment());
        collectionDto.setPrice(receivedCollection.getPrice());
        collectionDto.setCustomerId(receivedCollection.getCustomer().getId());

        LocalDate start = LocalDate.of(receivedCollection.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(receivedCollection.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(receivedCollection.getCustomer().getId(),
                        receivedCollection.getCompany(), start, end)
                .orElseGet(() -> getDefaultVoucher(receivedCollection.getCustomer(), receivedCollection.getCompany(), start));

        collectionDto.setFinalBalance(voucher.getFinalBalance());
        return collectionDto;
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

