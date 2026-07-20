package com.berksozcu.controller;

import com.berksozcu.dto.payroll.PayrollDto;
import com.berksozcu.entites.payroll.Payroll;
import org.springframework.data.domain.Page;

public interface IPayrollController {
    Page<PayrollDto> getPayrollsByYear(int page, int size, String search, String type, int year, String schemaName);

    PayrollDto addPayroll(Long id, PayrollDto newPayroll, String schemaName);

    PayrollDto editPayroll(Long id, PayrollDto newPayroll, String schemaName);

    void deletePayroll(Long id, String schemaName);
}
