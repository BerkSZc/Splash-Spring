package com.berksozcu.controller;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.user.User;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface ICompanyController {
    ResponseEntity<?> createCompany(Map<String, String> request, User user);
    void editCompany(Map<String, String> request);
     List<Company> findAllCompany(User user);
     ResponseEntity<Year> createYear(Long companyId, Integer year);
     ResponseEntity<List<Year>> getAllYear( Long companyId);
    void deleteYear( Long companyId, Integer year);
}
