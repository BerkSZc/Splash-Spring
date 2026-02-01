package com.berksozcu.service;

import com.berksozcu.entites.payroll.Payroll;

import java.util.List;

public interface IPayrollService {
    Payroll addPayroll(Long id, Payroll newPayroll);

    Payroll editPayroll(Long id, Payroll editPayroll);

    void deletePayroll(Long id);

     List<Payroll> getPayrollsByYear(int year);
}
