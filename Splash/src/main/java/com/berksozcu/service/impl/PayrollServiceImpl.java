package com.berksozcu.service.impl;

import com.berksozcu.dto.payroll.PayrollDto;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;
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
    public PayrollDto addPayroll(Long id, PayrollDto payrollDto, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Customer customer = customerRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );

        String fileNo = payrollDto.getFileNo() != null ? payrollDto.getFileNo().trim().toUpperCase() : "";

        if (payrollRepository.existsByFileNoAndCompany(fileNo, company)) {
            throw new BaseException(new ErrorMessage(MessageType.BORDRO_MEVCUT));
        }

        LocalDate start = LocalDate.of(payrollDto.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(payrollDto.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(id,
                        company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, customer, start));

        Payroll payroll = new Payroll();
        payroll.setCustomer(customer);
        payroll.setAmount(safeGet(payrollDto.getAmount()));
        payroll.setFileNo(fileNo);
        payroll.setExpiredDate(Objects.requireNonNullElse(payrollDto.getExpiredDate(), LocalDate.now()));
        payroll.setTransactionDate(Objects.requireNonNullElse(payrollDto.getTransactionDate(), LocalDate.now()));
        payroll.setPayrollModel(Objects.requireNonNullElse(payrollDto.getPayrollModel(), PayrollModel.INPUT));
        payroll.setPayrollType(Objects.requireNonNullElse(payrollDto.getPayrollType(), PayrollType.CHEQUE));
        payroll.setBankName(Objects.requireNonNullElse(payrollDto.getBankName(), "").toUpperCase());
        payroll.setBankBranch(Objects.requireNonNullElse(payrollDto.getBankBranch(), "").toUpperCase());
        payroll.setCompany(company);

        updateBalance(payrollDto, voucher);
        openingVoucherRepository.save(voucher);
        Payroll savedPayroll = payrollRepository.save(payroll);
        return convertDto(savedPayroll, start, end);
    }

    @Transactional
    @Override
    public PayrollDto editPayroll(Long id, PayrollDto payrollDto, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Payroll oldPayroll = payrollRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.BORDRO_HATA))
        );

        String fileNo = payrollDto.getFileNo() != null ? payrollDto.getFileNo().trim().toUpperCase() : "";

        if (payrollRepository.existsByFileNoAndCompany(fileNo, company)
                && !oldPayroll.getFileNo().equals(fileNo)) {
            throw new BaseException(new ErrorMessage(MessageType.BORDRO_MEVCUT));
        }

        if (!oldPayroll.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate oldStart = LocalDate.of(oldPayroll.getTransactionDate().getYear(), 1, 1);
        LocalDate oldEnd = LocalDate.of(oldPayroll.getTransactionDate().getYear(), 12, 31);

        Customer oldCustomer = oldPayroll.getCustomer();
        Customer newCustomer = customerRepository
                .findByIdAndCompany(payrollDto.getCustomerId(), company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        oldCustomer.getId(), company, oldStart, oldEnd)
                .orElseGet(() -> getDefaultVoucher(company, newCustomer, oldStart));


        if (oldPayroll.getPayrollModel() == PayrollModel.INPUT) {
            oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).add(safeGet(oldPayroll.getAmount())));
            oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldPayroll.getAmount())));
        } else {
            oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).subtract(safeGet(oldPayroll.getAmount())));
            oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldPayroll.getAmount())));
        }

        LocalDate start = LocalDate.of(payrollDto.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(payrollDto.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        newCustomer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(company, newCustomer, start));

        oldPayroll.setCompany(company);
        oldPayroll.setPayrollType(Objects.requireNonNullElse(payrollDto.getPayrollType(), PayrollType.UNKNOWN));
        oldPayroll.setBankName(Objects.requireNonNullElse(payrollDto.getBankName(), "").toUpperCase());
        oldPayroll.setPayrollModel(Objects.requireNonNullElse(payrollDto.getPayrollModel(), PayrollModel.UNKNOWN));
        oldPayroll.setAmount(safeGet(payrollDto.getAmount()));
        oldPayroll.setCustomer(newCustomer);
        oldPayroll.setFileNo(fileNo);
        oldPayroll.setTransactionDate(Objects.requireNonNullElse(payrollDto.getTransactionDate(), LocalDate.now()));
        oldPayroll.setExpiredDate(Objects.requireNonNullElse(payrollDto.getExpiredDate(), LocalDate.now()));
        oldPayroll.setBankBranch(Objects.requireNonNullElse(payrollDto.getBankBranch(), "").toUpperCase());

        updateBalance(payrollDto, newVoucher);

        openingVoucherRepository.save(oldVoucher);
        openingVoucherRepository.save(newVoucher);
        Payroll savedPayroll = payrollRepository.save(oldPayroll);
        return convertDto(savedPayroll, start, end);
    }

    @Transactional
    @Override
    public void deletePayroll(Long id, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Payroll payroll = payrollRepository.findByIdAndCompany(id, company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.BORDRO_HATA))
        );

        Customer customer = payroll.getCustomer();

        if (!payroll.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(payroll.getTransactionDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(payroll.getTransactionDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        customer.getId(), company, start, end)
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
    public Page<PayrollDto> getPayrollsByYear(int page, int size, String search, String type, int year, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);


        String searchParam;
        if (search == null || search.trim().isEmpty()) {
            searchParam = "";
        } else {
            searchParam = "%" + search.toLowerCase(Locale.forLanguageTag("tr-TR")).trim() + "%";
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());

        if (type == null || type.isEmpty()) {
            Page<Payroll> payrollPage = payrollRepository.findAllByStatement(company, searchParam, start, end, pageable);
            return payrollPage.map(payroll ->
                    convertDto(payroll, start, end)
            );
        }

        PayrollType pType = type.contains("cheque") ? PayrollType.CHEQUE : PayrollType.BOND;
        PayrollModel pModel = type.contains("_in") ? PayrollModel.INPUT : PayrollModel.OUTPUT;

        Page<Payroll> pageablePayroll = payrollRepository.findByCompanyAndSearchAndTransactionDateBetween(company, searchParam, start, end, pType, pModel, pageable);

        return pageablePayroll.map(payroll ->
                convertDto(payroll, start, end)
        );
    }

    private PayrollDto convertDto(Payroll payroll, LocalDate start, LocalDate end) {
        PayrollDto payrollDto = new PayrollDto();
        payrollDto.setId(payroll.getId());
        payrollDto.setCompanyId(payroll.getCompany().getId());
        payrollDto.setCustomerId(payroll.getCustomer().getId());
        payrollDto.setTransactionDate(payroll.getTransactionDate());
        payrollDto.setAmount(payroll.getAmount());
        payrollDto.setPayrollModel(payroll.getPayrollModel());
        payrollDto.setFileNo(payroll.getFileNo());
        payrollDto.setBankBranch(payroll.getBankBranch());
        payrollDto.setPayrollType(payroll.getPayrollType());
        payrollDto.setExpiredDate(payroll.getExpiredDate());
        payrollDto.setBankName(payroll.getBankName());
        payrollDto.setCustomerName(payroll.getCustomer().getName());

        OpeningVoucher openingVoucher = openingVoucherRepository
                .findByCustomerIdAndCompanyAndDateBetween(payroll.getCustomer().getId(), payroll.getCompany(), start, end)
                .orElseGet(() -> getDefaultVoucher(payroll.getCompany(), payroll.getCustomer(), start));


        payrollDto.setFinalBalance(openingVoucher.getFinalBalance());

        return payrollDto;
    }

    private void updateBalance(PayrollDto newPayroll, OpeningVoucher voucher) {
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