package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.payroll.PayrollType;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
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
import java.util.Objects;

@Service
public class PayrollServiceImpl implements IPayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Transactional
    @Override
    public Payroll addPayroll(Long id, Payroll newPayroll, String schemaName) {

        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        Company company = companyRepository.findBySchemaName(schemaName);

        if(payrollRepository.existsByFileNo(newPayroll.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.BORDRO_MEVCUT));
        }

        LocalDate start = LocalDate.of(newPayroll.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(newPayroll.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        newPayroll.setCustomer(customer);
        newPayroll.setAmount(safeGet(newPayroll.getAmount()));
        newPayroll.setFileNo(Objects.requireNonNullElse(newPayroll.getFileNo(), "").toUpperCase());
        newPayroll.setExpiredDate(Objects.requireNonNullElse(newPayroll.getExpiredDate(), LocalDate.now()));
        newPayroll.setTransactionDate(Objects.requireNonNullElse(newPayroll.getTransactionDate(), LocalDate.now()));
        newPayroll.setPayrollModel(Objects.requireNonNullElse(newPayroll.getPayrollModel(), PayrollModel.INPUT));
        newPayroll.setPayrollType(Objects.requireNonNullElse(newPayroll.getPayrollType(), PayrollType.CHEQUE));
        newPayroll.setBankName(Objects.requireNonNullElse(newPayroll.getBankName(), "").toUpperCase());
        newPayroll.setBankBranch(Objects.requireNonNullElse(newPayroll.getBankBranch(), "").toUpperCase());
        newPayroll.setCompany(company);

        updateBalance(newPayroll, voucher);
        openingVoucherRepository.save(voucher);
        return payrollRepository.save(newPayroll);
    }

    @Transactional
    @Override
    public Payroll editPayroll(Long id, Payroll editPayroll, String schemaName) {

        Payroll oldPayroll = payrollRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.BORDRO_HATA))
        );

        Company company = companyRepository.findBySchemaName(schemaName);

        if(payrollRepository.existsByFileNo(editPayroll.getFileNo())
        &&  !oldPayroll.getFileNo().equals(editPayroll.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.BORDRO_MEVCUT));
        }

        if(!oldPayroll.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(editPayroll.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(editPayroll.getTransactionDate().getYear(), 12, 31);

        Customer oldCustomer = oldPayroll.getCustomer();
        Customer newCustomer =  editPayroll.getCustomer();

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(oldCustomer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(company, newCustomer, start));


        if (oldPayroll.getPayrollModel() == PayrollModel.INPUT) {
            oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).add(safeGet(oldPayroll.getAmount())));
            oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldPayroll.getAmount())));
        } else {
            oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).subtract(safeGet(oldPayroll.getAmount())));
            oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldPayroll.getAmount())));
        }

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(newCustomer.getId(), start, end)
                        .orElseGet(() -> getDefaultVoucher(company, newCustomer, start));

        oldPayroll.setCompany(company);
        oldPayroll.setPayrollType(Objects.requireNonNullElse(editPayroll.getPayrollType(), PayrollType.UNKNOWN));
        oldPayroll.setBankName(Objects.requireNonNullElse(editPayroll.getBankName(), "").toUpperCase());
        oldPayroll.setPayrollModel(Objects.requireNonNullElse(editPayroll.getPayrollModel(), PayrollModel.UNKNOWN));
        oldPayroll.setAmount(safeGet(editPayroll.getAmount()));
        oldPayroll.setCustomer(newCustomer);
        oldPayroll.setFileNo(Objects.requireNonNullElse(editPayroll.getFileNo(), "").toUpperCase());
        oldPayroll.setTransactionDate(Objects.requireNonNullElse(editPayroll.getTransactionDate(), LocalDate.now()));
        oldPayroll.setExpiredDate(Objects.requireNonNullElse(editPayroll.getExpiredDate(), LocalDate.now()));
        oldPayroll.setBankBranch(Objects.requireNonNullElse(editPayroll.getBankBranch(), "").toUpperCase());

        updateBalance(editPayroll, newVoucher);

        openingVoucherRepository.save(oldVoucher);
        openingVoucherRepository.save(newVoucher);
        return payrollRepository.save(oldPayroll);
    }

    @Transactional
    @Override
    public void deletePayroll(Long id, String schemaName) {
        Payroll payroll = payrollRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.BORDRO_HATA))
        );

        Customer customer = payroll.getCustomer();
        Company company = companyRepository.findBySchemaName(schemaName);

        if(!payroll.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(payroll.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(payroll.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(customer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));


        if (payroll.getPayrollModel() == PayrollModel.INPUT) {
            voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(safeGet(payroll.getAmount())));
            voucher.setCredit(safeGet(voucher.getCredit()).subtract(safeGet(payroll.getAmount())));
        } else {
            voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(safeGet(payroll.getAmount())));
            voucher.setDebit(safeGet(voucher.getDebit()).subtract(safeGet(payroll.getAmount())));
        }
        openingVoucherRepository.save(voucher);
        payrollRepository.delete(payroll);
    }

    @Override
    public List<Payroll> getPayrollsByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return payrollRepository.findByTransactionDateBetween(start, end);
    }

    private void updateBalance( Payroll newPayroll, OpeningVoucher voucher) {
        if (newPayroll.getPayrollModel() == PayrollModel.INPUT) {
            voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(safeGet(newPayroll.getAmount())));
            voucher.setCredit(safeGet(voucher.getCredit()).add(safeGet(newPayroll.getAmount())));
        } else {
            voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(safeGet(newPayroll.getAmount())));
            voucher.setDebit(safeGet(voucher.getDebit()).add(safeGet(newPayroll.getAmount())));
        }
    }

    private OpeningVoucher getDefaultVoucher(Company company, Customer newCustomer, LocalDate date) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(Objects.requireNonNullElse(date, LocalDate.now()));
        voucher.setCustomer(newCustomer);
        voucher.setCustomerName(Objects.requireNonNullElse(newCustomer.getName(), ""));
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