package com.berksozcu.service.impl;

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
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
    public PaymentCompany addPaymentCompany(Long id, PaymentCompany paymentCompany, String schemaName) {
        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        Company company = companyRepository.findBySchemaName(schemaName);

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        if(paymentCompanyRepository.existsByFileNo(paymentCompany.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        LocalDate start = LocalDate.of(paymentCompany.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(paymentCompany.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(customer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(paymentCompany.getPrice());
        }

        paymentCompany.setCustomer(customer);
        paymentCompany.setCustomerName(customer.getName());
        paymentCompany.setDate(paymentCompany.getDate());
        paymentCompany.setComment(paymentCompany.getComment());
        paymentCompany.setPrice(paymentCompany.getPrice());
        paymentCompany.setFileNo(paymentCompany.getFileNo());
        paymentCompany.setCompany(company);

        voucher.setFinalBalance(voucher.getFinalBalance().add(paymentCompany.getPrice()));
        voucher.setDebit(voucher.getDebit().add(paymentCompany.getPrice()));

        openingVoucherRepository.save(voucher);
       return paymentCompanyRepository.save(paymentCompany);
    }

    @Override
    public List<PaymentCompany> getAll() {
        return paymentCompanyRepository.findAll();
    }

    @Override
    @Transactional
    public PaymentCompany editPaymentCompany(Long id, PaymentCompany paymentCompany, String schemaName) {

        PaymentCompany oldPayment = paymentCompanyRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

        Customer newCustomer = paymentCompany.getCustomer();
        Customer oldCustomer = oldPayment.getCustomer();

        Company company = companyRepository.findBySchemaName(schemaName);

        if(paymentCompanyRepository.existsByFileNo(paymentCompany.getFileNo())
        && !oldPayment.getFileNo().equals(paymentCompany.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.ISLEM_MEVCUT));
        }

        if(!oldPayment.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(paymentCompany.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(paymentCompany.getDate().getYear(), 12, 31);

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(oldCustomer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(company, newCustomer, start));

        if (oldVoucher.getFinalBalance() == null) {
            oldVoucher.setFinalBalance(paymentCompany.getPrice());
        }

        oldVoucher.setFinalBalance(oldVoucher.getFinalBalance().subtract(oldPayment.getPrice()));
        oldVoucher.setDebit(oldVoucher.getDebit().subtract(oldPayment.getPrice()));

        oldPayment.setDate(paymentCompany.getDate());
        oldPayment.setComment(paymentCompany.getComment());
        oldPayment.setPrice(paymentCompany.getPrice());
        oldPayment.setCustomer(newCustomer);
        oldPayment.setFileNo(paymentCompany.getFileNo());
        oldPayment.setCompany(company);
        oldPayment.setCustomerName(paymentCompany.getCustomerName());

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(newCustomer.getId(), start, end)
                        .orElseGet(() -> getDefaultVoucher(company, newCustomer, start));

        BigDecimal newFinalBalance = newVoucher.getFinalBalance() != null ? newVoucher.getFinalBalance() : BigDecimal.ZERO;
        newVoucher.setFinalBalance(newFinalBalance.add(paymentCompany.getPrice()));
        newVoucher.setDebit(newVoucher.getDebit().add(paymentCompany.getPrice()));

        openingVoucherRepository.save(newVoucher);
        openingVoucherRepository.save(oldVoucher);
        return paymentCompanyRepository.save(oldPayment);
    }

    @Override
    @Transactional
    public void deletePaymentCompany(Long id, String schemaName) {
        PaymentCompany paymentCompany = paymentCompanyRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

        Company company = companyRepository.findBySchemaName(schemaName);
        Customer customer = paymentCompany.getCustomer();

        if(!paymentCompany.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(paymentCompany.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(paymentCompany.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(customer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(paymentCompany.getPrice());
        }

        voucher.setFinalBalance(voucher.getFinalBalance().subtract(paymentCompany.getPrice()));
        voucher.setDebit(voucher.getDebit().subtract(paymentCompany.getPrice()));

        openingVoucherRepository.save(voucher);
        paymentCompanyRepository.deleteById(id);
    }

    @Override
    public List<PaymentCompany> getPaymentCollectionsByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return paymentCompanyRepository.findByDateBetween(start, end);
    }

    private OpeningVoucher getDefaultVoucher (Company company, Customer newCustomer, LocalDate date) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(date);
        voucher.setCustomer(newCustomer);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setYearlyDebit(BigDecimal.ZERO);
        voucher.setYearlyCredit(BigDecimal.ZERO);
        voucher.setFinalBalance(BigDecimal.ZERO);
        voucher.setCustomerName(newCustomer.getName());
        voucher.setDescription("Eklendi");
        voucher.setFileNo("001");
      return   openingVoucherRepository.save(voucher);
    }
}
