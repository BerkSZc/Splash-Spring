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

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(customer.getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyDebit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(paymentCompany.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(paymentCompany.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(paymentCompany.getPrice());
        }

        paymentCompany.setCustomer(customer);

        paymentCompany.setCustomerName(customer.getName());

        paymentCompany.setId(paymentCompany.getId());
        paymentCompany.setDate(paymentCompany.getDate());
        paymentCompany.setComment(paymentCompany.getComment());
        paymentCompany.setPrice(paymentCompany.getPrice());
        paymentCompany.setCustomerName(paymentCompany.getCustomer().getName());
        paymentCompany.setFileNo(paymentCompany.getFileNo());
        paymentCompany.setCompany(company);

        voucher.setFinalBalance(voucher.getFinalBalance().add(paymentCompany.getPrice()));
        voucher.setDebit(voucher.getDebit().add(paymentCompany.getPrice()));
        openingVoucherRepository.save(voucher);
        customerRepository.save(customer);
        paymentCompanyRepository.save(paymentCompany);

        return paymentCompany;
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

        Customer oldCustomer = customerRepository.findById(oldPayment.getCustomer().getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        Customer newCustomer = customerRepository.findById(paymentCompany.getCustomer().getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

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

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(paymentCompany.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(paymentCompany.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(paymentCompany.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(paymentCompany.getPrice());
        }

        boolean sameCustomer = oldCustomer.getId().equals(newCustomer.getId());


        if (sameCustomer) {
            BigDecimal fark = paymentCompany.getPrice().subtract(oldPayment.getPrice());
            voucher.setFinalBalance(voucher.getFinalBalance().subtract(fark));
            voucher.setDebit(voucher.getDebit().add(fark));
            customerRepository.save(oldCustomer);
        } else {
            voucher.setFinalBalance(voucher.getFinalBalance().add(oldPayment.getPrice()));
            voucher.setDebit(voucher.getDebit().add(oldPayment.getPrice()));
            customerRepository.save(oldCustomer);

            voucher.setFinalBalance(voucher.getFinalBalance().subtract(paymentCompany.getPrice()));
            voucher.setDebit(voucher.getDebit().add(paymentCompany.getPrice()));
            customerRepository.save(newCustomer);
        }

        oldPayment.setDate(paymentCompany.getDate());
        oldPayment.setComment(paymentCompany.getComment());
        oldPayment.setPrice(paymentCompany.getPrice());
        oldPayment.setCustomer(newCustomer);
        oldPayment.setFileNo(paymentCompany.getFileNo());

        openingVoucherRepository.save(voucher);
        return paymentCompanyRepository.save(oldPayment);
    }

    @Override
    @Transactional
    public void deletePaymentCompany(Long id, String schemaName) {
        PaymentCompany paymentCompany = paymentCompanyRepository.findById(id).orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.ODEME_BULUNAMADI)));

        Company company = companyRepository.findBySchemaName(schemaName);

        if(!paymentCompany.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(paymentCompany.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(paymentCompany.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(paymentCompany.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(paymentCompany.getPrice());
                    newVoucher.setDate(LocalDate.of(paymentCompany.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(paymentCompany.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(paymentCompany.getPrice());
        }

        Customer customer = paymentCompany.getCustomer();
        voucher.setFinalBalance(voucher.getFinalBalance().subtract(paymentCompany.getPrice()));
        voucher.setDebit(voucher.getDebit().subtract(paymentCompany.getPrice()));
        customerRepository.save(customer);
        paymentCompanyRepository.deleteById(id);
    }

    @Override
    public List<PaymentCompany> getPaymentCollectionsByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return paymentCompanyRepository.findByDateBetween(start, end);
    }
}
