package com.berksozcu.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FullReportDto {
    private List<MonthlyKdvDto> purchaseReports;
    private List<MonthlyKdvDto> salesReports;
    private List<Map<String, Object>> kdvAnalysis;
}
