package com.berksozcu.service;

import com.berksozcu.entites.payroll.Payroll;
import org.springframework.data.domain.Page;


public interface IPayrollService {
    Payroll addPayroll(Long id, Payroll newPayroll, String schemaName);

    Payroll editPayroll(Long id, Payroll editPayroll, String schemaName);

    void deletePayroll(Long id, String schemaName);

     Page<Payroll> getPayrollsByYear(int page, int size, String search, int year, String schemaName);
}
