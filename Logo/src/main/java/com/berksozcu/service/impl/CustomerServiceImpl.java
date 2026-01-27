package com.berksozcu.service.impl;

import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.ICustomerService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements ICustomerService {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Override
    public Customer findCustomerById(Long id) {
        Optional<Customer> optional = customerRepository.findById(id);
        if (optional.isEmpty()) {
            throw new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI));
        }
        Customer customer = new Customer();
        customer.setId(optional.get().getId());
        customer.setName(optional.get().getName());

        return customer;
    }


    @Override
    @Transactional
    public Customer addCustomer(DtoCustomer newCustomer, int year) {
        Customer customer = new Customer();
        customer.setName(newCustomer.getName());
        customer.setAddress(newCustomer.getAddress());
        customer.setCountry(newCustomer.getCountry());
        customer.setCode(newCustomer.getCode());
        customer.setLocal(newCustomer.getLocal());
        customer.setDistrict(newCustomer.getDistrict());
        customer.setVdNo(newCustomer.getVdNo());
        customer.setCode("0123");
        customerRepository.save(customer);

        LocalDate date = LocalDate.of(year, 1, 1);

        BigDecimal finalBalance = newCustomer.getYearlyDebit().subtract(newCustomer.getYearlyCredit().setScale(2, RoundingMode.HALF_UP));

             OpeningVoucher openingVoucher =
                     openingVoucherRepository.findByCustomerIdAndDate(customer.getId(), date)
                        .orElseGet(() -> {
                            OpeningVoucher newOpeningVoucher = new OpeningVoucher();
                            newOpeningVoucher.setCustomerName(customer.getName());
                            newOpeningVoucher.setCustomer(customer);
                            newOpeningVoucher.setDescription("Yeni Müşteri");
                            newOpeningVoucher.setFileNo("001");
                            newOpeningVoucher.setDate(date);
                            newOpeningVoucher.setFinalBalance(finalBalance);
                            newOpeningVoucher.setYearlyDebit(newCustomer.getYearlyDebit());
                            newOpeningVoucher.setYearlyCredit(newCustomer.getYearlyCredit());
                            newOpeningVoucher.setDebit(BigDecimal.ZERO);
                            newOpeningVoucher.setCredit(BigDecimal.ZERO);
                            return newOpeningVoucher;
                        });
                openingVoucherRepository.save(openingVoucher);
        return customer;
    }

    @Override
    public List<Customer> getAllCustomer() {
        return customerRepository.findAll();
    }

    @Override
    @Transactional
    public void updateCustomer(Long id, DtoCustomer updateCustomer, int currentYear) {
        Customer oldCustomer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );
        if (oldCustomer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }
        oldCustomer.setName(updateCustomer.getName());
        oldCustomer.setAddress(updateCustomer.getAddress());
        oldCustomer.setLocal(updateCustomer.getLocal());
        oldCustomer.setDistrict(updateCustomer.getDistrict());
        oldCustomer.setVdNo(updateCustomer.getVdNo());
        oldCustomer.setCountry(updateCustomer.getCountry());
        oldCustomer.setCode(updateCustomer.getCode());

        LocalDate start = LocalDate.of(currentYear, 1, 1);
        LocalDate end = LocalDate.of(currentYear, 12, 31);

        OpeningVoucher openingVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newV = new OpeningVoucher();
                    newV.setCustomer(oldCustomer);
                    newV.setCustomerName(oldCustomer.getName());
                    newV.setDate(start);
                    newV.setFileNo("01");
                    newV.setDescription(currentYear + " Yılı Manuel Devir");
                    newV.setFinalBalance(BigDecimal.ZERO);
                    newV.setYearlyCredit(BigDecimal.ZERO);
                    newV.setYearlyCredit(BigDecimal.ZERO);
                    return newV;
                });


        BigDecimal updatedCredit = updateCustomer.getYearlyCredit();
        BigDecimal updatedDebit = updateCustomer.getYearlyDebit();

        BigDecimal oldCredit = openingVoucher.getYearlyCredit();
        BigDecimal oldDebit = openingVoucher.getYearlyDebit();

        BigDecimal newCredit = updatedCredit.subtract(oldCredit);
        BigDecimal newDebit = updatedDebit.subtract(oldDebit);

        BigDecimal finalBalance = newDebit.subtract(newCredit).setScale(2, RoundingMode.HALF_UP);

        BigDecimal currentBalance = openingVoucher.getFinalBalance() != null ? openingVoucher.getFinalBalance() : BigDecimal.ZERO;

        openingVoucher.setYearlyCredit(updatedCredit);
        openingVoucher.setYearlyDebit(updatedDebit);
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
    public void setArchived(List<Long> ids, boolean archived) {
        customerRepository.updateArchivedStatus(ids, archived);
    }
}

