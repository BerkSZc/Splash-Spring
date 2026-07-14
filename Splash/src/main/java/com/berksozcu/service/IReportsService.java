package com.berksozcu.service;

import com.berksozcu.dto.customer.CustomerDto;
import com.berksozcu.dto.report.FullReportDto;
import com.berksozcu.entites.customer.OpeningVoucher;

import java.time.LocalDate;
import java.util.List;

public interface IReportsService {
     FullReportDto getFullReport(int year, String schemaName);
     List<CustomerDto> getAllOpeningVoucherByDateBetween(LocalDate start, LocalDate end, String schemaName
    );
    }
