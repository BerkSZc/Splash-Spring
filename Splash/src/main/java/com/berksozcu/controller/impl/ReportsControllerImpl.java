package com.berksozcu.controller.impl;

import com.berksozcu.controller.IReportsController;
import com.berksozcu.dto.report.DtoFullReport;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.service.IReportsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/rest/api/report")
public class ReportsControllerImpl implements IReportsController {

    @Autowired
    private IReportsService reportService;

    @GetMapping("/all-reports")
    @Override
    public ResponseEntity<DtoFullReport> getAllReports(@RequestParam int year, @RequestParam String schemaName) {
        return ResponseEntity.ok(reportService.getFullReport(year, schemaName));
    }

    @GetMapping("/get-balance-status")
    @Override
    public List<OpeningVoucher> getAllOpeningVoucherDateBetween(@RequestParam LocalDate start, @RequestParam LocalDate end,
                                                            @RequestParam String schemaName
                                                         ) {
        return reportService.getAllOpeningVoucherByDateBetween(start, end, schemaName );
    }
}
