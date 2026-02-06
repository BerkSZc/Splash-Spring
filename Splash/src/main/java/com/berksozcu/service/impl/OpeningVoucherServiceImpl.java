package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
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
                        .orElseGet(() -> getDefaultVoucher(company, customer, openingDate));

        closingVoucher.setFinalBalance(closingVoucher.getFinalBalance().setScale(2, RoundingMode.HALF_UP));
        openingVoucherRepository.save(closingVoucher);

        // ---------- AÇILIŞ VOUCHER (01.01) ----------
        OpeningVoucher openingVoucher =
                openingVoucherRepository
                        .findByCustomerIdAndDate(customer.getId(), openingDate)
                        .orElseGet(() -> getDefaultVoucher(company, customer, openingDate));

        openingVoucher.setFinalBalance(closingVoucher.getFinalBalance());
        openingVoucher.setYearlyDebit(closingVoucher.getDebit());
        openingVoucher.setYearlyCredit(closingVoucher.getCredit());
        openingVoucher.setDebit(BigDecimal.ZERO);
        openingVoucher.setCredit(BigDecimal.ZERO);

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
    public List<OpeningVoucher> getAllOpeningVoucherByCustomer(LocalDate date) {
        List<Customer> allCustomers = customerRepository.findAll();

        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);
        List<OpeningVoucher> vouchers = new ArrayList<>();
        for (Customer customer : allCustomers) {
            List<OpeningVoucher> results = openingVoucherRepository
                    .findAllByCustomerIdAndDateBetween(customer.getId(), start, end);

            vouchers.add(results.isEmpty() ? null : results.get(0));
        }
        return vouchers;
    }

    @Override
    public OpeningVoucher getOpeningVoucherByCustomer(Long customerId, LocalDate date) {
        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);
        return openingVoucherRepository.findByCustomerIdAndDateBetween(customerId, start, end)
                .orElse(null);
    }

    private OpeningVoucher getDefaultVoucher(Company company, Customer newCustomer, LocalDate date) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(date);
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
}