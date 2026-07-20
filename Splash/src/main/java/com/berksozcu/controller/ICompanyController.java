package com.berksozcu.controller;

import com.berksozcu.dto.company.CompanyDto;
import com.berksozcu.dto.company.YearDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.user.User;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface ICompanyController {
    ResponseEntity<CompanyDto> createCompany(Map<String, String> request, User user);
    CompanyDto editCompany(Map<String, String> request);
     List<CompanyDto> findAllCompany(User user);
     ResponseEntity<YearDto> createYear(Long companyId, Integer year);
     ResponseEntity<List<YearDto>> getAllYear( Long companyId);
    void deleteYear( Long companyId, Integer year);
}
