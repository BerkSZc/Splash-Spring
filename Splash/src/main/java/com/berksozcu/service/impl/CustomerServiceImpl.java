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
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements ICustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

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
    public Customer addCustomer(DtoCustomer newCustomer, int year, String schemaName) {

        if (customerRepository.existsByCode(newCustomer.getCode())) {
            throw new BaseException(new ErrorMessage(MessageType.MUSTERI_KOD_MEVCUT));
        }

        Customer customer = new Customer();
        customer.setName(newCustomer.getName());
        customer.setAddress(newCustomer.getAddress());
        customer.setCountry(newCustomer.getCountry());
        customer.setLocal(newCustomer.getLocal());
        customer.setDistrict(newCustomer.getDistrict());
        customer.setVdNo(newCustomer.getVdNo());
        customer.setCode(newCustomer.getCode());
        customer.setArchived(false);

        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

       OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(customer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(getCompany(schemaName), customer, start, newCustomer));

       voucher.setYearlyCredit(newCustomer.getYearlyCredit());
       voucher.setYearlyDebit(newCustomer.getYearlyDebit());
       openingVoucherRepository.save(voucher);
        return customerRepository.save(customer);
    }

    @Override
    public List<Customer> getAllCustomer() {
        return customerRepository.findAll();
    }

    @Override
    @Transactional
    public void updateCustomer(Long id, DtoCustomer updateCustomer, int currentYear, String schemaName) {

        Customer oldCustomer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        if (oldCustomer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        if (customerRepository.existsByCode(updateCustomer.getCode())
                && !updateCustomer.getCode().equals(oldCustomer.getCode())) {
            throw new BaseException(new ErrorMessage(MessageType.MUSTERI_KOD_MEVCUT));
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
                .orElseGet(() -> getDefaultVoucher(getCompany(schemaName), oldCustomer, start, updateCustomer));


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

    private Company getCompany(String schemaName) {
        return companyRepository.findBySchemaName(schemaName);
    }

    private OpeningVoucher getDefaultVoucher(Company company, Customer customer, LocalDate date, DtoCustomer dtoCustomer) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(date);
        voucher.setCustomer(customer);
        voucher.setCustomerName(customer.getName());
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setYearlyDebit(dtoCustomer.getYearlyDebit());
        voucher.setYearlyCredit(dtoCustomer.getYearlyCredit());
        voucher.setFinalBalance(dtoCustomer.getYearlyDebit().subtract(dtoCustomer.getYearlyCredit().setScale(2, RoundingMode.HALF_UP)));
        voucher.setFileNo("001");
        voucher.setDescription("Eklendi");
        return openingVoucherRepository.save(voucher);
    }

}

