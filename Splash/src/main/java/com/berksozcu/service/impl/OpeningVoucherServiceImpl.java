package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.IOpeningVoucherService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


@Service
public class OpeningVoucherServiceImpl implements IOpeningVoucherService {


    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CompanyRepository companyRepository;


    @Transactional
    @Override
    public OpeningVoucher calculateAndSetOpeningVoucher(Customer customer, int targetYear, String schemaName) {

        Company company = companyRepository.findBySchemaName(schemaName);

        int closingYear = targetYear - 1;

        LocalDate closingDate = LocalDate.of(closingYear, 1, 1);
        LocalDate openingDate = LocalDate.of(targetYear, 1, 1);

        // ---------- KAPANIŞ VOUCHER (31.12) ----------
        OpeningVoucher closingVoucher =
                openingVoucherRepository
                        .findByCustomerIdAndDate(customer.getId(), closingDate)
                        .orElseGet(() -> getDefaultVoucher(company, customer, closingDate));

        closingVoucher.setFinalBalance(safeGet(closingVoucher.getFinalBalance()).setScale(2, RoundingMode.HALF_UP));
        openingVoucherRepository.save(closingVoucher);

        // ---------- AÇILIŞ VOUCHER (01.01) ----------
        OpeningVoucher openingVoucher =
                openingVoucherRepository
                        .findByCustomerIdAndDate(customer.getId(), openingDate)
                        .orElseGet(() -> getDefaultVoucher(company, customer, openingDate));

        openingVoucher.setFinalBalance(safeGet(closingVoucher.getFinalBalance()));
        openingVoucher.setYearlyDebit(safeGet(closingVoucher.getDebit()));
        openingVoucher.setYearlyCredit(safeGet(closingVoucher.getCredit()));

        return openingVoucherRepository.save(openingVoucher);
    }

    @Transactional
    public void transferAllCustomers(int targetYear, String schemaName) {
        List<Customer> allCustomers = customerRepository.findAll();

        for (Customer customer : allCustomers) {
            try {
                this.calculateAndSetOpeningVoucher(customer, targetYear, schemaName);
            } catch (Exception e) {
                System.err.println("Müşteri devir hatası (" + customer.getName() + "): " + e.getMessage());
            }
        }
    }

    @Override
    public List<OpeningVoucher> getAllOpeningVoucherByCustomer(LocalDate date, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        List<Customer> allCustomers = customerRepository.findAll();
        List<OpeningVoucher> vouchers = new ArrayList<>();

        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);

        for (Customer customer : allCustomers) {
            OpeningVoucher voucher = openingVoucherRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> getDefaultVoucher(company, customer, start));
            vouchers.add(voucher);
        }
        return vouchers;
    }

    @Override
    public OpeningVoucher getOpeningVoucherByCustomer(Long customerId, LocalDate date, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        return openingVoucherRepository.findByCustomerIdAndDateBetween(customerId, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));
    }

    private OpeningVoucher getDefaultVoucher(Company company, Customer newCustomer, LocalDate date) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(Objects.requireNonNullElse(date, LocalDate.now()));
        voucher.setCustomer(newCustomer);
        voucher.setCustomerName(newCustomer.getName());
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setYearlyDebit(BigDecimal.ZERO);
        voucher.setYearlyCredit(BigDecimal.ZERO);
        voucher.setFinalBalance(BigDecimal.ZERO);
        voucher.setFileNo("001");
        voucher.setDescription("Eklendi");
        return openingVoucherRepository.save(voucher);
    }

    private BigDecimal safeGet(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}