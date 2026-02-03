package com.berksozcu.service;

import com.berksozcu.entites.payroll.Payroll;

import java.util.List;

public interface IPayrollService {
    Payroll addPayroll(Long id, Payroll newPayroll, String schemaName);

    Payroll editPayroll(Long id, Payroll editPayroll, String schemaName);

    void deletePayroll(Long id, String schemaName);

     List<Payroll> getPayrollsByYear(int year);
}
