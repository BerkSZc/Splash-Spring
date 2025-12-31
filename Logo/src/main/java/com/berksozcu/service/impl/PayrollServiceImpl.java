package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.PayrollRepository;
import com.berksozcu.service.IPayrollService;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
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

    @Transactional
    @Override
    public Payroll addPayroll(Long id, Payroll newPayroll) {

        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );
        Payroll payroll = new Payroll();

        payroll.setCustomer(customer);
        payroll.setAmount(newPayroll.getAmount());
        payroll.setFileNo(newPayroll.getFileNo());
        payroll.setExpiredDate(newPayroll.getExpiredDate());
        payroll.setTransactionDate(newPayroll.getTransactionDate());
        payroll.setPayrollModel(newPayroll.getPayrollModel());
        payroll.setPayrollType(newPayroll.getPayrollType());

        updateBalance(customer, newPayroll);

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

        if (oldPayroll.getPayrollModel() == PayrollModel.INPUT) {
            customer.setBalance(customer.getBalance().add(oldPayroll.getAmount()));
        } else {
            customer.setBalance(customer.getBalance().subtract(oldPayroll.getAmount()));
        }

        BeanUtils.copyProperties(editPayroll, oldPayroll, "id", "customer");

        if (oldPayroll.getPayrollModel() == PayrollModel.INPUT) {
            customer.setBalance(customer.getBalance().subtract(oldPayroll.getAmount()));
        } else {
            customer.setBalance(customer.getBalance().add(oldPayroll.getAmount()));
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

        if (payroll.getPayrollModel() == PayrollModel.INPUT) {

            customer.setBalance(customer.getBalance().add(payroll.getAmount()));
            customerRepository.save(customer);
        } else {
            customer.setBalance(customer.getBalance().subtract(payroll.getAmount()));

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

    private void updateBalance(Customer customer, Payroll newPayroll) {
        if (newPayroll.getPayrollModel() == PayrollModel.INPUT) {

            customer.setBalance(customer.getBalance().subtract(newPayroll.getAmount()));
        } else {

            customer.setBalance(customer.getBalance().add(newPayroll.getAmount()));
        }
    }
}