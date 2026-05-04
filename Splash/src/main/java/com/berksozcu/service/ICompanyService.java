package com.berksozcu.service;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.user.User;

import java.sql.SQLException;
import java.util.List;

public interface ICompanyService {
     void createNewTenantSchema(String schemaName, String companyName, String description, String sourceSchema, User user) throws SQLException;
     List<Year> getYearsByCompany(Long companyId);
     Year addYearToCompany(Long companyId, Integer year);
     void deleteCompanyAndYear(Long companyId, Integer year);
     String createDefaultSchemaName();
     void editCompany(String schemaName, String companyName, String description);
     List<Company> getAllCompanies(User user);
}
