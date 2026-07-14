package com.berksozcu.service.impl;

import com.berksozcu.dto.customer.CustomerDto;
import com.berksozcu.dto.customer.OpeningVoucherDto;
import com.berksozcu.dto.report.FullReportDto;
import com.berksozcu.dto.report.MonthlyKdvDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
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
import java.util.stream.Collectors;

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
    public FullReportDto getFullReport(int year, String schemaName) {

        Company company =  companyRepository.findBySchemaName(schemaName);

        List<MonthlyKdvDto> purchases = purchaseInvoiceRepository.getMonthlyPurchases(year, company.getId());

        List<MonthlyKdvDto> sales = salesInvoiceRepository.getMonthlySales(year, company.getId());

        List<Map<String, Object>> analysis = calculateKdvAnalysis(purchases, sales, year);

        return new FullReportDto(purchases, sales, analysis);
    }

    @Override
    public List<CustomerDto> getAllOpeningVoucherByDateBetween(LocalDate start, LocalDate end, String schemaName
    ) {
        Company company = companyRepository.findBySchemaName(schemaName);

        List<OpeningVoucher> openingVouchers = openingVoucherRepository.findAllOpeningVoucherByDateBetweenAndCompanyIdOrderByDateDesc
                (start, end, company.getId());

     return    openingVouchers.stream().map(openingVoucher -> {
            Customer customer = openingVoucher.getCustomer();

            CustomerDto customerDto = new CustomerDto();
            customerDto.setId(customer.getId());
            customerDto.setCode(customer.getCode());
            customerDto.setName(customer.getName());
            customerDto.setAddress(customer.getAddress());
            customerDto.setCountry(customer.getCountry());
            customerDto.setLocal(customer.getLocal());
            customerDto.setDistrict(customer.getDistrict());
            customerDto.setVdNo(customer.getVdNo());
            customerDto.setCompanyId(company.getId());
            customerDto.setArchived(customer.isArchived());

            customerDto.setYearlyCredit(openingVoucher.getYearlyCredit());
            customerDto.setYearlyDebit(openingVoucher.getYearlyDebit());
            customerDto.setFinalBalance(openingVoucher.getFinalBalance());

            return customerDto;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> calculateKdvAnalysis(List<MonthlyKdvDto> purchases, List<MonthlyKdvDto> sales, int year) {
        List<Map<String, Object>> analysisList = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            final int month = i;
            BigDecimal pKdv = purchases.stream().filter(p -> p.getMonth() == month).findFirst().map(MonthlyKdvDto::getTotalKdv).orElse(BigDecimal.ZERO);
            BigDecimal sKdv = sales.stream().filter(s -> s.getMonth() == month).findFirst().map(MonthlyKdvDto::getTotalKdv).orElse(BigDecimal.ZERO);

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
