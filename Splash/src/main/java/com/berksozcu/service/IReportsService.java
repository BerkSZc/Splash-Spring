package com.berksozcu.service;

import com.berksozcu.dto.report.balance.DtoBalanceReport;
import com.berksozcu.dto.report.DtoFullReport;
import com.berksozcu.entites.customer.OpeningVoucher;

import java.time.LocalDate;
import java.util.List;

public interface IReportsService {
     DtoFullReport getFullReport(int year, String schemaName);
     List<OpeningVoucher> getAllOpeningVoucherByDateBetween(LocalDate start, LocalDate end, String schemaName
    );
    }
