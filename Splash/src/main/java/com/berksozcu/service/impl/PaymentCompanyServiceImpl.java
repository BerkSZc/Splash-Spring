package com.berksozcu.service.impl;

import com.berksozcu.dto.collection.CollectionDto;
import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.repository.PaymentCompanyRepository;
import com.berksozcu.service.IPaymentCompanyService;
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
public class PaymentCompanyServiceImpl implements IPaymentCompanyService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    @Transactional
    public CollectionDto addPaymentCompany(Long id, CollectionDto paymentCompanyDto, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Customer customer = customerRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        String fileNo = paymentCompanyDto.getFileNo() != null ? paymentCompanyDto.getFileNo().trim().toUpperCase() : "";

        if (paymentCompanyRepository.existsByFileNoAndCompany(fileNo, company)) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        LocalDate paymentDate = Objects.requireNonNullElse(paymentCompanyDto.getDate(), LocalDate.now());

        LocalDate start = LocalDate.of(paymentDate.getYear(), 1, 1);
        LocalDate end = LocalDate.of(paymentDate.getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        customer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        PaymentCompany newPaymentCompany = new PaymentCompany();

        newPaymentCompany.setCustomer(customer);
        newPaymentCompany.setCustomerName(Objects.requireNonNullElse(customer.getName(), "").toUpperCase());
        newPaymentCompany.setDate(paymentDate);
        newPaymentCompany.setComment(Objects.requireNonNullElse(paymentCompanyDto.getComment(), ""));
        newPaymentCompany.setPrice(safeGet(paymentCompanyDto.getPrice()));
        newPaymentCompany.setFileNo(fileNo);
        newPaymentCompany.setCompany(company);

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(paymentCompanyDto.getPrice()));
        voucher.setDebit(safeGet(voucher.getDebit()).add(paymentCompanyDto.getPrice()));

        openingVoucherRepository.save(voucher);
        PaymentCompany savedCompany = paymentCompanyRepository.save(newPaymentCompany);

        return convertToDto(savedCompany, start, end);
    }

    @Override
    @Transactional
    public CollectionDto editPaymentCompany(Long id, CollectionDto paymentCompany, String schemaName) {

        Company company = companyRepository.findBySchemaName(schemaName);

        PaymentCompany oldPayment = paymentCompanyRepository.findByIdAndCompany(id, company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

        Customer newCustomer = customerRepository.findById(paymentCompany.getCustomerId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));
        Customer oldCustomer = oldPayment.getCustomer();


        if (paymentCompanyRepository.existsByFileNoAndCompany(paymentCompany.getFileNo(), company)
                && !oldPayment.getFileNo().equals(paymentCompany.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        if (!oldPayment.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate date = Objects.requireNonNullElse(paymentCompany.getDate(), LocalDate.now());

        LocalDate oldStart = LocalDate.of(oldPayment.getDate().getYear(), 1, 1);
        LocalDate oldEnd = LocalDate.of(oldPayment.getDate().getYear(), 12, 31);

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        oldCustomer.getId(), company, oldStart, oldEnd)
                .orElseGet(() -> getDefaultVoucher(company, oldCustomer, oldStart));

        oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).subtract(oldPayment.getPrice()));
        oldVoucher.setDebit(safeGet(oldVoucher.getDebit()).subtract(oldPayment.getPrice()));

        oldPayment.setDate(date);
        oldPayment.setComment(Objects.requireNonNullElse(paymentCompany.getComment(), ""));
        oldPayment.setPrice(safeGet(paymentCompany.getPrice()));
        oldPayment.setCustomer(newCustomer);
        String fileNo = paymentCompany.getFileNo() != null ? paymentCompany.getFileNo().trim().toUpperCase() : "";
        oldPayment.setFileNo(fileNo);
        oldPayment.setCompany(company);
        oldPayment.setCustomerName(Objects.requireNonNullElse(paymentCompany.getCustomerName(), "").toUpperCase());

        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        newCustomer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, newCustomer, start));

        BigDecimal newFinalBalance = Objects.requireNonNullElse(newVoucher.getFinalBalance(), BigDecimal.ZERO);
        newVoucher.setFinalBalance(safeGet(newFinalBalance).add(safeGet(paymentCompany.getPrice())));
        newVoucher.setDebit(safeGet(newVoucher.getDebit()).add(safeGet(paymentCompany.getPrice())));

        openingVoucherRepository.save(oldVoucher);

        openingVoucherRepository.save(newVoucher);
        PaymentCompany savedCollection = paymentCompanyRepository.save(oldPayment);

        return convertToDto(savedCollection, start, end);
    }

    @Override
    @Transactional
    public void deletePaymentCompany(Long id, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        PaymentCompany paymentCompany = paymentCompanyRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

        Customer customer = paymentCompany.getCustomer();

        if (!paymentCompany.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(paymentCompany.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(paymentCompany.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        customer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(safeGet(paymentCompany.getPrice())));
        voucher.setDebit(safeGet(voucher.getDebit()).subtract(safeGet(paymentCompany.getPrice())));

        openingVoucherRepository.save(voucher);
        paymentCompanyRepository.deleteById(id);
    }

    @Override
    public Page<CollectionDto> getPaymentCollectionsByYear(int page, int size, String search, int year, String schemaName) {
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

        Page<PaymentCompany> pageablePayment = paymentCompanyRepository.findByCompanyAndSearchAndDateBetween(company, searchParam, start, end, pageable);

        return pageablePayment.map(payment -> convertToDto(payment, start, end));
    }

    private CollectionDto convertToDto(PaymentCompany paymentCompany, LocalDate start, LocalDate end) {
        CollectionDto paymentCompanyDto = new CollectionDto();
        paymentCompanyDto.setId(paymentCompany.getId());
        paymentCompanyDto.setFileNo(paymentCompany.getFileNo());
        paymentCompanyDto.setCustomerName(paymentCompany.getCustomerName());
        paymentCompanyDto.setDate(paymentCompany.getDate());
        paymentCompanyDto.setCompanyId(paymentCompany.getCompany().getId());
        paymentCompanyDto.setComment(paymentCompany.getComment());
        paymentCompanyDto.setPrice(paymentCompany.getPrice());
        paymentCompanyDto.setCustomerId(paymentCompany.getCustomer().getId());

        OpeningVoucher openingVoucher = openingVoucherRepository
                .findByCustomerIdAndCompanyAndDateBetween(paymentCompany.getCustomer().getId(), paymentCompany.getCompany(),
                        start, end)
                .orElseGet(() -> getDefaultVoucher(paymentCompany.getCompany(), paymentCompany.getCustomer(), start));

        paymentCompanyDto.setFinalBalance(openingVoucher.getFinalBalance() != null ? openingVoucher.getFinalBalance() : BigDecimal.ZERO);
        return paymentCompanyDto;
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
