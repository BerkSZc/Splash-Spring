package com.berksozcu.service;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;

import java.sql.SQLException;
import java.util.List;

public interface ICompanyService {
     void createNewTenantSchema(String schemaName, String companyName, String description, String sourceSchema) throws SQLException;
     List<Company> getAllCompanies();
     List<Year> getYearsByCompany(Long companyId);
     Year addYearToCompany(Long companyId, Integer year);
     void deleteCompanyAndYear(Long companyId, Integer year);
}
