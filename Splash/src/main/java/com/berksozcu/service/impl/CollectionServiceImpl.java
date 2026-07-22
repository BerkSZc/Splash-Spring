package com.berksozcu.service.impl;

import com.berksozcu.dto.collection.CollectionDto;
import com.berksozcu.entites.collections.Collection;
import com.berksozcu.entites.collections.CollectionType;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CollectionRepository;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.service.ICollectionService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Objects;

@Service
public class CollectionServiceImpl implements ICollectionService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    @Transactional
    public CollectionDto addCollection(Long id, CollectionDto collectionDto, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Customer customer = customerRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        String fileNo = collectionDto.getFileNo() != null ? collectionDto.getFileNo().trim().toUpperCase() : "";

        CollectionType type = collectionDto.getType();

        if (collectionRepository.existsByFileNoAndCompanyAndType(fileNo, company, type)) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        LocalDate paymentDate = Objects.requireNonNullElse(collectionDto.getDate(), LocalDate.now());

        LocalDate start = LocalDate.of(paymentDate.getYear(), 1, 1);
        LocalDate end = LocalDate.of(paymentDate.getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        customer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        BigDecimal price = safeGet(collectionDto.getPrice());

        Collection newCollection = new Collection();
        newCollection.setCustomer(customer);
        newCollection.setCustomerName(Objects.requireNonNullElse(customer.getName(), "").toUpperCase());
        newCollection.setDate(paymentDate);
        newCollection.setComment(Objects.requireNonNullElse(collectionDto.getComment(), ""));
        newCollection.setPrice(price);
        newCollection.setFileNo(fileNo);
        newCollection.setCompany(company);
        newCollection.setType(type);

        updateVoucherBalance(voucher, type, price, true);

        openingVoucherRepository.save(voucher);
        Collection savedCompany = collectionRepository.save(newCollection);

        return convertToDto(savedCompany, start, end);
    }

    @Override
    @Transactional
    public CollectionDto editCollection(Long id, CollectionDto collectionDto, String schemaName) {

        Company company = companyRepository.findBySchemaName(schemaName);
        CollectionType type = collectionDto.getType();

        Collection oldCollection = collectionRepository.findByIdAndCompany(id, company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

        if (!oldCollection.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        Customer newCustomer = customerRepository.findById(collectionDto.getCustomerId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));
        Customer oldCustomer = oldCollection.getCustomer();

        if (collectionRepository.existsByFileNoAndCompanyAndType(collectionDto.getFileNo(), company, type)
                && !oldCollection.getFileNo().equals(collectionDto.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        LocalDate date = Objects.requireNonNullElse(collectionDto.getDate(), LocalDate.now());

        LocalDate oldStart = LocalDate.of(oldCollection.getDate().getYear(), 1, 1);
        LocalDate oldEnd = LocalDate.of(oldCollection.getDate().getYear(), 12, 31);

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        oldCustomer.getId(), company, oldStart, oldEnd)
                .orElseGet(() -> getDefaultVoucher(company, oldCustomer, oldStart));

        BigDecimal price = safeGet(collectionDto.getPrice());

        updateVoucherBalance(oldVoucher, oldCollection.getType(), oldCollection.getPrice(), false);
        openingVoucherRepository.save(oldVoucher);

        oldCollection.setDate(date);
        oldCollection.setComment(Objects.requireNonNullElse(collectionDto.getComment(), ""));
        oldCollection.setPrice(price);
        oldCollection.setCustomer(newCustomer);
        String fileNo = collectionDto.getFileNo() != null ? collectionDto.getFileNo().trim().toUpperCase() : "";
        oldCollection.setFileNo(fileNo);
        oldCollection.setCompany(company);
        oldCollection.setCustomerName(Objects.requireNonNullElse(collectionDto.getCustomerName(), "").toUpperCase());
        oldCollection.setType(type);

        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);

        OpeningVoucher newVoucher;

        if (newCustomer.getId().equals(oldCustomer.getId()) && oldStart.equals(start)) {
            newVoucher = oldVoucher;
        } else {
            newVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                            newCustomer.getId(), company, start, end)
                    .orElseGet(() -> getDefaultVoucher(company, newCustomer, start));
        }

        updateVoucherBalance(newVoucher, type, price, true);

        openingVoucherRepository.save(newVoucher);
        Collection savedCollection = collectionRepository.save(oldCollection);

        return convertToDto(savedCollection, start, end);
    }

    @Override
    @Transactional
    public void deleteCollection(Long id, String schemaName, CollectionType type) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Collection collection = collectionRepository.findByIdAndCompanyAndType(id, company, type).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

        if (!collection.getType().equals(type)) {
            throw new BaseException(new ErrorMessage(MessageType.TIP_UYUSMUYOR));
        }

        Customer customer = collection.getCustomer();

        if (!collection.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(collection.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(collection.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        customer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        updateVoucherBalance(voucher, collection.getType(), safeGet(collection.getPrice()), false);

        openingVoucherRepository.save(voucher);
        collectionRepository.deleteById(id);
    }

    @Override
    public Page<CollectionDto> getCollectionsByYear(int page, int size, String search, int year, String schemaName, CollectionType type) {
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

        Page<Collection> pageablePayment;
        if (type == null) {
            pageablePayment = collectionRepository.findByCompanyAndSearchAndDateBetween(company, searchParam, start,
                    end, pageable);
        } else {
            pageablePayment = collectionRepository
                    .findByCompanyAndSearchAndDateBetweenAndType(company, searchParam, start, end, pageable, type);
        }


        return pageablePayment.map(payment -> convertToDto(payment, start, end));
    }


    private void updateVoucherBalance(OpeningVoucher voucher, CollectionType type, BigDecimal price, boolean isAdding) {
        BigDecimal finalBalance = safeGet(voucher.getFinalBalance());
        BigDecimal debit = safeGet(voucher.getDebit());
        BigDecimal credit = safeGet(voucher.getCredit());

        if (type.equals(CollectionType.PAYMENT)) {
            if (isAdding) {
                voucher.setFinalBalance(finalBalance.add(price));
                voucher.setDebit(debit.add(price));
            } else {
                voucher.setFinalBalance(finalBalance.subtract(price));
                voucher.setDebit(debit.subtract(price));
            }
        } else {
            if (isAdding) {
                voucher.setFinalBalance(finalBalance.subtract(price));
                voucher.setCredit(credit.add(price));
            } else {
                voucher.setFinalBalance(finalBalance.add(price));
                voucher.setCredit(credit.subtract(price));
            }
        }
    }

    private CollectionDto convertToDto(Collection collection, LocalDate start, LocalDate end) {
        CollectionDto collectionDto = new CollectionDto();
        collectionDto.setId(collection.getId());
        collectionDto.setFileNo(collection.getFileNo());
        collectionDto.setCustomerName(collection.getCustomerName());
        collectionDto.setDate(collection.getDate());
        collectionDto.setCompanyId(collection.getCompany().getId());
        collectionDto.setComment(collection.getComment());
        collectionDto.setPrice(collection.getPrice());
        collectionDto.setCustomerId(collection.getCustomer().getId());
        collectionDto.setType(collection.getType());

        OpeningVoucher openingVoucher = openingVoucherRepository
                .findByCustomerIdAndCompanyAndDateBetween(collection.getCustomer().getId(), collection.getCompany(),
                        start, end)
                .orElseGet(() -> getDefaultVoucher(collection.getCompany(), collection.getCustomer(), start));

        collectionDto.setFinalBalance(openingVoucher.getFinalBalance() != null ? openingVoucher.getFinalBalance() : BigDecimal.ZERO);
        return collectionDto;
    }

    private OpeningVoucher getDefaultVoucher(Company company, Customer newCustomer, LocalDate date) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(Objects.requireNonNullElse(date, LocalDate.now()));
        voucher.setCustomer(newCustomer);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setYearlyDebit(BigDecimal.ZERO);
        voucher.setYearlyCredit(BigDecimal.ZERO);
        voucher.setFinalBalance(BigDecimal.ZERO);
        voucher.setCustomerName(Objects.requireNonNullElse(newCustomer.getName(), ""));
        voucher.setDescription("Eklendi");
        voucher.setFileNo("001");
        return openingVoucherRepository.save(voucher);
    }

    private BigDecimal safeGet(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
