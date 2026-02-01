package com.berksozcu.controller;

import com.berksozcu.entites.payroll.Payroll;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface IPayrollController {
     List<Payroll> getPayrollsByYear(@RequestParam int year);
     Payroll addPayroll(@PathVariable(name = "id") Long id, @RequestBody Payroll newPayroll);
     Payroll editPayroll(@PathVariable(name = "id") Long id, @RequestBody Payroll newPayroll);
     void deletePayroll(@PathVariable(name = "id") Long id);
}
