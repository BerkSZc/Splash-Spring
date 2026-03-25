package com.berksozcu.service.impl;

import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.service.ICustomerService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class CustomerServiceImpl implements ICustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    @Transactional
    public Customer addCustomer(DtoCustomer newCustomer, int year, String schemaName) {

        Company company = getCompany(schemaName);

        if (customerRepository.existsByCodeAndCompany(newCustomer.getCode(), company)) {
            throw new BaseException(new ErrorMessage(MessageType.MUSTERI_KOD_MEVCUT));
        }

        Customer customer = new Customer();
        customer.setName(Objects.requireNonNullElse(newCustomer.getName(), "").toUpperCase());
        customer.setAddress(Objects.requireNonNullElse(newCustomer.getAddress(), "").toUpperCase());
        customer.setCountry(Objects.requireNonNullElse(newCustomer.getCountry(), "").toUpperCase());
        customer.setLocal(Objects.requireNonNullElse(newCustomer.getLocal(), "").toUpperCase());
        customer.setDistrict(Objects.requireNonNullElse(newCustomer.getDistrict(), "").toUpperCase());
        customer.setVdNo(Objects.requireNonNullElse(newCustomer.getVdNo(), ""));
        customer.setCode(Objects.requireNonNullElse(newCustomer.getCode(), "").trim().toUpperCase());
        customer.setCompany(company);
        customer.setArchived(false);
        Customer savedCustomer = customerRepository.save(customer);

        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(savedCustomer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start, newCustomer));

        voucher.setYearlyCredit(safeGet(newCustomer.getYearlyCredit()));
        voucher.setYearlyDebit(safeGet(newCustomer.getYearlyDebit()));
        openingVoucherRepository.save(voucher);
        return savedCustomer;
    }

    @Override
    public Page<Customer> getAllCustomer(int page, int size, Boolean archived, String search, String schemaName) {
        Company company = getCompany(schemaName);

        Pageable pageable = PageRequest.of(page, size);

        String searchParam;
        if (search == null || search.trim().isEmpty()) {
            searchParam = "";
        } else {
            searchParam = "%" + search.toLowerCase(Locale.forLanguageTag("tr-TR")).trim() + "%";
        }

        boolean isArchived = archived != null && archived;

        return customerRepository.findAllByCompanyAndArchivedAndSearch(company, isArchived, searchParam, pageable);
    }

    @Override
    @Transactional
    public void updateCustomer(Long id, DtoCustomer updateCustomer, int currentYear, String schemaName) {

        Company company = getCompany(schemaName);

        Customer oldCustomer = customerRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        if (oldCustomer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        if (customerRepository.existsByCodeAndCompany(updateCustomer.getCode(), company)
                && !updateCustomer.getCode().equals(oldCustomer.getCode())) {
            throw new BaseException(new ErrorMessage(MessageType.MUSTERI_KOD_MEVCUT));
        }

        if(!company.equals(oldCustomer.getCompany())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        oldCustomer.setName(Objects.requireNonNullElse(updateCustomer.getName(), "").toUpperCase());
        oldCustomer.setAddress(Objects.requireNonNullElse(updateCustomer.getAddress(), "").toUpperCase());
        oldCustomer.setLocal(Objects.requireNonNullElse(updateCustomer.getLocal(), "").toUpperCase());
        oldCustomer.setDistrict(Objects.requireNonNullElse(updateCustomer.getDistrict(), "").toUpperCase());
        oldCustomer.setVdNo(Objects.requireNonNullElse(updateCustomer.getVdNo(), ""));
        oldCustomer.setCountry(Objects.requireNonNullElse(updateCustomer.getCountry(), "").toUpperCase());
        oldCustomer.setCode(Objects.requireNonNullElse(updateCustomer.getCode(), "").trim().toUpperCase());

        LocalDate start = LocalDate.of(currentYear, 1, 1);
        LocalDate end = LocalDate.of(currentYear, 12, 31);

        OpeningVoucher openingVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(id, company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, oldCustomer, start, updateCustomer));


        BigDecimal updatedCredit = safeGet(updateCustomer.getYearlyCredit());
        BigDecimal updatedDebit = safeGet(updateCustomer.getYearlyDebit());

        BigDecimal oldCredit = safeGet(openingVoucher.getYearlyCredit());
        BigDecimal oldDebit = safeGet(openingVoucher.getYearlyDebit());

        BigDecimal newCredit = updatedCredit.subtract(oldCredit);
        BigDecimal newDebit = updatedDebit.subtract(oldDebit);

        BigDecimal finalBalance = newDebit.subtract(newCredit).setScale(2, RoundingMode.HALF_UP);

        BigDecimal currentBalance = safeGet(openingVoucher.getFinalBalance());

        openingVoucher.setYearlyCredit(updatedCredit);
        openingVoucher.setYearlyDebit(updatedDebit);
        openingVoucher.setCredit(safeGet(openingVoucher.getCredit()).add(newCredit));
        openingVoucher.setDebit(safeGet(openingVoucher.getDebit()).add(newDebit));
        openingVoucher.setFinalBalance(currentBalance.add(finalBalance));

        openingVoucherRepository.save(openingVoucher);
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
    public void setArchived(List<Long> ids, boolean archived, String schemaName) {
        Company company = getCompany(schemaName);
        customerRepository.updateArchivedStatus(ids, archived, company);
    }

    private Company getCompany(String schemaName) {
        return companyRepository.findBySchemaName(schemaName);
    }

    private OpeningVoucher getDefaultVoucher(Company company, Customer customer, LocalDate date, DtoCustomer dtoCustomer) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(Objects.requireNonNullElse(date, LocalDate.now()));
        voucher.setCustomer(customer);
        voucher.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setYearlyDebit(safeGet(dtoCustomer.getYearlyDebit()));
        voucher.setYearlyCredit(safeGet(dtoCustomer.getYearlyCredit()));
        voucher.setFinalBalance(safeGet(dtoCustomer.getYearlyDebit()).subtract(safeGet(dtoCustomer.getYearlyCredit())).setScale(2, RoundingMode.HALF_UP));
        voucher.setFileNo("001");
        voucher.setDescription("Eklendi");
        return openingVoucherRepository.save(voucher);
    }

    private BigDecimal safeGet (BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}

