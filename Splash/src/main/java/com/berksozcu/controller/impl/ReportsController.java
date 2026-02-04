package com.berksozcu.controller.impl;

import com.berksozcu.dto.report.DtoFullReport;
import com.berksozcu.service.impl.ReportsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/rest/api/report")
public class ReportsController {

    @Autowired
    private ReportsService reportService;

    @GetMapping("/all-reports")
    public ResponseEntity<DtoFullReport> getAllReports(@RequestParam int year, @RequestParam String schemaName) {
        return ResponseEntity.ok(reportService.getFullReport(year, schemaName));
    }
}
