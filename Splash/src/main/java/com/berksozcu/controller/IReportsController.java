package com.berksozcu.controller;

import com.berksozcu.dto.report.DtoFullReport;
import com.berksozcu.entites.customer.OpeningVoucher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

public interface IReportsController {
     ResponseEntity<DtoFullReport> getAllReports(@RequestParam int year, @RequestParam String schemaName);

     List<OpeningVoucher> getAllOpeningVoucherDateBetween(@RequestParam LocalDate start, @RequestParam LocalDate end,
                                                                  @RequestParam String schemaName
    );

}
