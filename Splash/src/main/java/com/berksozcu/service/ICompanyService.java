package com.berksozcu.service;

import com.berksozcu.dto.company.CompanyDto;
import com.berksozcu.dto.company.YearDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.user.User;

import java.sql.SQLException;
import java.util.List;

public interface ICompanyService {
     CompanyDto createNewTenantSchema(String schemaName, String companyName, String description, String sourceSchema, User user) throws SQLException;
     List<YearDto> getYearsByCompany(Long companyId);
     YearDto addYearToCompany(Long companyId, Integer year);
     void deleteCompanyAndYear(Long companyId, Integer year);
     String createDefaultSchemaName();
     CompanyDto editCompany(String schemaName, String companyName, String description);
     List<CompanyDto> getAllCompanies(User user);
}
