package com.berksozcu.service.impl;

import com.berksozcu.dto.report.balance.DtoBalanceReport;
import com.berksozcu.dto.report.DtoFullReport;
import com.berksozcu.dto.report.DtoMonthlyKdv;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.repository.SalesInvoiceRepository;
import com.berksozcu.service.IReportsService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.berksozcu.repository.PurchaseInvoiceRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportsServiceImpl implements IReportsService {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Override
    @Transactional
    public DtoFullReport getFullReport(int year, String schemaName) {

        Company company =  companyRepository.findBySchemaName(schemaName);

        List<DtoMonthlyKdv> purchases = purchaseInvoiceRepository.getMonthlyPurchases(year, company.getId());

        List<DtoMonthlyKdv> sales = salesInvoiceRepository.getMonthlySales(year, company.getId());

        List<Map<String, Object>> analysis = calculateKdvAnalysis(purchases, sales, year);

        return new DtoFullReport(purchases, sales, analysis);
    }

    @Override
    public List<OpeningVoucher> getAllOpeningVoucherByDateBetween(LocalDate start, LocalDate end, String schemaName
    ) {
        Company company = companyRepository.findBySchemaName(schemaName);

        return openingVoucherRepository.findAllOpeningVoucherByDateBetweenAndCompanyIdOrderByDateDesc
                (start, end, company.getId());
    }

    private List<Map<String, Object>> calculateKdvAnalysis(List<DtoMonthlyKdv> purchases, List<DtoMonthlyKdv> sales, int year) {
        List<Map<String, Object>> analysisList = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            final int month = i;
            BigDecimal pKdv = purchases.stream().filter(p -> p.getMonth() == month).findFirst().map(DtoMonthlyKdv::getTotalKdv).orElse(BigDecimal.ZERO);
            BigDecimal sKdv = sales.stream().filter(s -> s.getMonth() == month).findFirst().map(DtoMonthlyKdv::getTotalKdv).orElse(BigDecimal.ZERO);

            Map<String, Object> row = new HashMap<>();
            row.put("month", month);
            row.put("year", year);
            row.put("purchaseKdv", pKdv);
            row.put("salesKdv", sKdv);
            row.put("diff", sKdv.subtract(pKdv));
            analysisList.add(row);
        }
        return analysisList;
    }
}
