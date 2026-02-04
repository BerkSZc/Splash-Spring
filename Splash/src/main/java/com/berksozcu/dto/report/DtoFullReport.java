package com.berksozcu.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DtoFullReport {
    private List<DtoMonthlyKdv> purchaseReports;
    private List<DtoMonthlyKdv> salesReports;
    private List<Map<String, Object>> kdvAnalysis;
}
