package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.repository.PayrollRepository;
import com.berksozcu.service.IPayrollService;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PayrollServiceImpl implements IPayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Transactional
    @Override
    public Payroll addPayroll(Long id, Payroll newPayroll) {

        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        if(payrollRepository.existsByFileNo(newPayroll.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.BORDRO_MEVCUT));
        }

        LocalDate start = LocalDate.of(newPayroll.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(newPayroll.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(customer.getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(newPayroll.getTransactionDate().getYear(), 1, 1));
                    newVoucher.setCustomer(newPayroll.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(newPayroll.getAmount());
        }

        Payroll payroll = new Payroll();

        payroll.setCustomer(customer);
        payroll.setAmount(newPayroll.getAmount());
        payroll.setFileNo(newPayroll.getFileNo());
        payroll.setExpiredDate(newPayroll.getExpiredDate());
        payroll.setTransactionDate(newPayroll.getTransactionDate());
        payroll.setPayrollModel(newPayroll.getPayrollModel());
        payroll.setPayrollType(newPayroll.getPayrollType());
        payroll.setBankName(newPayroll.getBankName());
        payroll.setBankBranch(newPayroll.getBankBranch());

        updateBalance(customer, newPayroll, voucher);
        openingVoucherRepository.save(voucher);
        customerRepository.save(customer);
        return payrollRepository.save(payroll);
    }


    @Transactional
    @Override
    public Payroll editPayroll(Long id, Payroll editPayroll) {

        Payroll oldPayroll = payrollRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.BORDRO_HATA))
        );
        Customer customer = oldPayroll.getCustomer();

        if(payrollRepository.existsByFileNo(editPayroll.getFileNo())
        &&  !oldPayroll.getFileNo().equals(editPayroll.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.BORDRO_MEVCUT));
        }

        LocalDate start = LocalDate.of(editPayroll.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(editPayroll.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(editPayroll.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(editPayroll.getTransactionDate().getYear(), 1, 1));
                    newVoucher.setCustomer(customer);
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(editPayroll.getAmount());
        }

        if (oldPayroll.getPayrollModel() == PayrollModel.INPUT) {
            voucher.setFinalBalance(voucher.getFinalBalance().add(oldPayroll.getAmount()));
            voucher.setCredit(voucher.getCredit().add(oldPayroll.getAmount()));
        } else {
            voucher.setFinalBalance(voucher.getFinalBalance().subtract(oldPayroll.getAmount()));
            voucher.setCredit(voucher.getCredit().subtract(oldPayroll.getAmount()));
        }

        BeanUtils.copyProperties(editPayroll, oldPayroll, "id", "customer");

        if (oldPayroll.getPayrollModel() == PayrollModel.INPUT) {
            voucher.setFinalBalance(voucher.getFinalBalance().subtract(oldPayroll.getAmount()));
            voucher.setCredit(voucher.getCredit().add(oldPayroll.getAmount()));
        } else {
            voucher.setFinalBalance(voucher.getFinalBalance().add(oldPayroll.getAmount()));
            voucher.setDebit(voucher.getDebit().add(oldPayroll.getAmount()));
        }

        customerRepository.save(customer);
        return payrollRepository.save(oldPayroll);
    }

    @Transactional
    @Override
    public void deletePayroll(Long id) {
        Payroll payroll = payrollRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.BORDRO_HATA))
        );

        Customer customer = payroll.getCustomer();


        LocalDate start = LocalDate.of(payroll.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(payroll.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(customer.getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(payroll.getAmount());
                    newVoucher.setDate(LocalDate.of(payroll.getTransactionDate().getYear(), 1, 1));
                    newVoucher.setCustomer(customer);
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(payroll.getAmount());
        }


        if (payroll.getPayrollModel() == PayrollModel.INPUT) {
            voucher.setFinalBalance(voucher.getFinalBalance().add(payroll.getAmount()));
            voucher.setCredit(voucher.getCredit().subtract(payroll.getAmount()));
            customerRepository.save(customer);
        } else {
            voucher.setFinalBalance(voucher.getFinalBalance().subtract(payroll.getAmount()));
            voucher.setDebit(voucher.getDebit().subtract(payroll.getAmount()));
        }
        customerRepository.save(customer);
        payrollRepository.delete(payroll);
    }

    @Override
    public List<Payroll> getPayrollsByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return payrollRepository.findByTransactionDateBetween(start, end);
    }

    private void updateBalance(Customer customer, Payroll newPayroll, OpeningVoucher voucher) {
        if (newPayroll.getPayrollModel() == PayrollModel.INPUT) {
            voucher.setFinalBalance(voucher.getFinalBalance().subtract(newPayroll.getAmount()));
            voucher.setCredit(voucher.getCredit().add(newPayroll.getAmount()));
        } else {
            voucher.setFinalBalance(voucher.getFinalBalance().add(newPayroll.getAmount()));
            voucher.setDebit(voucher.getDebit().add(newPayroll.getAmount()));
        }
    }
}