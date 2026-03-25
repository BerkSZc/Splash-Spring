package com.berksozcu.controller.impl;

import com.berksozcu.controller.IPayrollController;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.service.IPayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/payroll")
public class PayrollControllerImpl implements IPayrollController {

    @Autowired
    private IPayrollService payrollService;

    @Override
    @GetMapping("/find-by-year")
    public Page<Payroll> getPayrollsByYear(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size,
                                           @RequestParam(required = false) String search,
                                           @RequestParam int year,
                                           @RequestParam String schemaName) {
        return payrollService.getPayrollsByYear(page, size, search, year, schemaName);
    }

    @Override
    @PostMapping("/add/{id}")
    public Payroll addPayroll(@PathVariable(name = "id") Long id, @RequestBody Payroll newPayroll,
                              @RequestParam String schemaName) {
        return payrollService.addPayroll(id, newPayroll, schemaName);
    }

    @Override
    @PutMapping("/edit/{id}")
    public Payroll editPayroll(@PathVariable(name = "id") Long id, @RequestBody Payroll newPayroll
            , String schemaName) {
        return payrollService.editPayroll(id, newPayroll, schemaName);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deletePayroll(@PathVariable(name = "id") Long id,
                              String schemaName) {
        payrollService.deletePayroll(id, schemaName);
    }

}
