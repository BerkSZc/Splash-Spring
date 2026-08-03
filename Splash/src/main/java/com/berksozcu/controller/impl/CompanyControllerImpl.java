package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.dto.company.CompanyDto;
import com.berksozcu.dto.company.YearDto;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.security.AuthenticationService;
import com.berksozcu.service.ICompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rest/api/company")
@RateLimit(capacity = 100)
public class CompanyControllerImpl {
    @Autowired
    private ICompanyService companyService;

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/create")
    public ResponseEntity<CompanyDto> createCompany(@RequestBody CompanyDto companyDto, @RequestBody Map<String, String> request, @AuthenticationPrincipal User user) {
        String sourceSchema = request.get("sourceSchema");
        if(companyDto.getName() == null || companyDto.getName().isEmpty()) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_HATA));
        }

        if(sourceSchema == null || sourceSchema.isEmpty()) {
            sourceSchema = "splash";
        }

        String schemaName = companyService.createDefaultSchemaName();

        try {
            CompanyDto createdCompanyDto = companyService.createNewTenantSchema(companyDto, sourceSchema, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCompanyDto);
        } catch (Exception e) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_HATA));
        }
    }

    @PutMapping("/edit-company")
    public CompanyDto editCompany(@RequestBody CompanyDto companyDto) {


        return companyService.editCompany(companyDto);
    }

    @GetMapping("/find-all")
    public List<CompanyDto> findAllCompany(@AuthenticationPrincipal User user) {
        if (user == null) return List.of();
        return companyService.getAllCompanies(user);
    }

    @PostMapping("/create-year")
    public ResponseEntity<YearDto> createYear(@RequestParam Long companyId, @RequestParam Integer year) {
        return ResponseEntity.ok(companyService.addYearToCompany(companyId, year));
    }

    @GetMapping("/get-all-year")
    public ResponseEntity<List<YearDto>> getAllYear(@RequestParam Long companyId) {
        return ResponseEntity.ok(companyService.getYearsByCompany(companyId));
    }

    @DeleteMapping("/delete-year")
    public void deleteYear(@RequestParam Long companyId, @RequestParam Integer year) {
         companyService.deleteCompanyAndYear(companyId, year);
    }

    @PostMapping("/switch-company/{companyId}")
    public ResponseEntity<UserResponse> switchCompany(@PathVariable Long companyId) {
       UserResponse response = authenticationService.switchCompany(companyId);
       return ResponseEntity.ok(response);
    }
}
