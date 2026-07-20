package com.berksozcu.service;

import com.berksozcu.dto.payroll.PayrollDto;
import com.berksozcu.entites.payroll.Payroll;
import org.springframework.data.domain.Page;


public interface IPayrollService {
    PayrollDto addPayroll(Long id, PayrollDto newPayroll, String schemaName);

    PayrollDto editPayroll(Long id, PayrollDto editPayroll, String schemaName);

    void deletePayroll(Long id, String schemaName);

     Page<PayrollDto> getPayrollsByYear(int page, int size, String search, String type, int year, String schemaName);
}
