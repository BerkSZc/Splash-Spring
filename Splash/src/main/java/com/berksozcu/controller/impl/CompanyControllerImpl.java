package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.ICompanyController;
import com.berksozcu.dto.company.CompanyDto;
import com.berksozcu.dto.company.YearDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.security.AuthenticationService;
import com.berksozcu.service.ICompanyService;
import com.berksozcu.service.impl.CompanyServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rest/api/company")
@RateLimit(capacity = 100)
public class CompanyControllerImpl implements ICompanyController {
    @Autowired
    private ICompanyService companyService;

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/create")
    @Override
    public ResponseEntity<?> createCompany(@RequestBody Map<String, String> request, @AuthenticationPrincipal User user) {
        String companyName = request.get("name");
        String description = request.get("desc");
        String sourceSchema = request.get("sourceSchema");
        if(companyName == null || companyName.isEmpty()) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_HATA));
        }

        if(sourceSchema == null || sourceSchema.isEmpty()) {
            sourceSchema = "splash";
        }

        String schemaName = companyService.createDefaultSchemaName();

        try {
            companyService.createNewTenantSchema(schemaName, companyName, description, sourceSchema, user);
            return ResponseEntity.ok("Şema '" + schemaName + "' başarıyla oluşturuldu.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Şema oluşturma hatası: " + e.getMessage());
        }
    }

    @PutMapping("/edit-company")
    @Override
    public void editCompany(@RequestBody Map<String, String> request) {
        String schemaName = request.get("schemaName");
        String companyName = request.get("companyName");
        String description = request.get("description");

        companyService.editCompany(schemaName, companyName, description);
    }

    @GetMapping("/find-all")
    @Override
    public List<CompanyDto> findAllCompany(@AuthenticationPrincipal User user) {
        if (user == null) return List.of();
        return companyService.getAllCompanies(user);
    }

    @PostMapping("/create-year")
    @Override
    public ResponseEntity<YearDto> createYear(@RequestParam Long companyId, @RequestParam Integer year) {
        return ResponseEntity.ok(companyService.addYearToCompany(companyId, year));
    }

    @GetMapping("/get-all-year")
    @Override
    public ResponseEntity<List<YearDto>> getAllYear(@RequestParam Long companyId) {
        return ResponseEntity.ok(companyService.getYearsByCompany(companyId));
    }

    @DeleteMapping("/delete-year")
    @Override
    public void deleteYear(@RequestParam Long companyId, @RequestParam Integer year) {
         companyService.deleteCompanyAndYear(companyId, year);
    }

    @PostMapping("/switch-company/{companyId}")
    public ResponseEntity<UserResponse> switchCompany(@PathVariable Long companyId) {
       UserResponse response = authenticationService.switchCompany(companyId);
       return ResponseEntity.ok(response);
    }
}
