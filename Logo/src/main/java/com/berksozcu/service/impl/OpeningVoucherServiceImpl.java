package com.berksozcu.service.impl;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.sales.SalesInvoice;
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
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;

    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;

    @Autowired
    private CustomerRepository customerRepository;


    @Transactional
    @Override
    public OpeningVoucher calculateAndSetOpeningVoucher(Customer customer, int targetYear) {

        int closingYear = targetYear - 1;

        LocalDate closingDate = LocalDate.of(closingYear, 1, 1);
        LocalDate openingDate = LocalDate.of(targetYear, 1, 1);
//
//
//        BigDecimal debitSum =
//                totalSales.add(totalPayments)
//                        .add(debitBalance)
//                        .add(payrollOut);
//
//        BigDecimal creditSum =
//                totalPurchases.add(totalCollections)
//                        .add(payrollIn).add(creditBalance);

//        BigDecimal finalBalance = debitSum.subtract(creditSum);

        // ---------- KAPANIŞ VOUCHER (31.12) ----------
        OpeningVoucher closingVoucher =
                openingVoucherRepository
                        .findByCustomerIdAndDate(customer.getId(), closingDate)
                        .orElseGet(() -> {
                            OpeningVoucher oldVoucher = new OpeningVoucher();
                            oldVoucher.setFinalBalance(BigDecimal.ZERO);
                            oldVoucher.setCustomerName(customer.getName());
                            oldVoucher.setDebit(BigDecimal.ZERO);
                            oldVoucher.setCredit(BigDecimal.ZERO);
                            oldVoucher.setDescription("Yeni Eklendi");
                            oldVoucher.setDate(closingDate);
                            oldVoucher.setCustomer(customer);
                            oldVoucher.setFileNo("00001");
                            oldVoucher.setYearlyCredit(BigDecimal.ZERO);
                            oldVoucher.setYearlyDebit(BigDecimal.ZERO);
                            return oldVoucher;
                        });

        closingVoucher.setFinalBalance(closingVoucher.getFinalBalance().setScale(2, RoundingMode.HALF_UP));
        openingVoucherRepository.save(closingVoucher);


        // ---------- AÇILIŞ VOUCHER (01.01) ----------
        OpeningVoucher openingVoucher =
                openingVoucherRepository
                        .findByCustomerIdAndDate(customer.getId(), openingDate)
                        .orElseGet(() -> {
                            OpeningVoucher newVoucher = new OpeningVoucher();
                            newVoucher.setFinalBalance(closingVoucher.getFinalBalance().setScale(2, RoundingMode.HALF_UP));
                            newVoucher.setCustomerName(customer.getName());
                            newVoucher.setDebit(closingVoucher.getDebit());
                            newVoucher.setCredit(closingVoucher.getCredit());
                            newVoucher.setDescription("Yeni Eklendi");
                            newVoucher.setDate(openingDate);
                            newVoucher.setCustomer(customer);
                            newVoucher.setFileNo("00001");
                            newVoucher.setYearlyCredit(closingVoucher.getCredit().setScale(2, RoundingMode.HALF_UP));
                            newVoucher.setYearlyDebit(closingVoucher.getDebit().setScale(2, RoundingMode.HALF_UP));
                            return newVoucher;
                        });

        openingVoucher.setFinalBalance(closingVoucher.getFinalBalance());


        // Borç / Alacak sadece açılışta yazılır
        if (closingVoucher.getFinalBalance().compareTo(BigDecimal.ZERO) >= 0) {
            openingVoucher.setDebit(closingVoucher.getDebit().setScale(2, RoundingMode.HALF_UP));
            openingVoucher.setCredit(closingVoucher.getCredit().setScale(2, RoundingMode.HALF_UP));
        } else {
            openingVoucher.setDebit(closingVoucher.getDebit().setScale(2, RoundingMode.HALF_UP));
            openingVoucher.setCredit(closingVoucher.getCredit().abs().setScale(2,RoundingMode.HALF_UP));
        }

        customerRepository.save(customer);
        return openingVoucherRepository.save(openingVoucher);
    }

    @Transactional
    public void transferAllCustomers(int targetYear) {
        List<Customer> allCustomers = customerRepository.findAll();

        for (Customer customer : allCustomers) {
            try {
                this.calculateAndSetOpeningVoucher(customer, targetYear);
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
            // Yeni 'findAllBy...' metodunu kullanıyoruz
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
}