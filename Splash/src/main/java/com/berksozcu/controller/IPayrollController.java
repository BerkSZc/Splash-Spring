package com.berksozcu.controller;

import com.berksozcu.entites.payroll.Payroll;
import org.springframework.data.domain.Page;

public interface IPayrollController {
    Page<Payroll> getPayrollsByYear(int page, int size, int year, String schemaName);

    Payroll addPayroll(Long id, Payroll newPayroll, String schemaName);

    Payroll editPayroll(Long id, Payroll newPayroll, String schemaName);

    void deletePayroll(Long id, String schemaName);
}
