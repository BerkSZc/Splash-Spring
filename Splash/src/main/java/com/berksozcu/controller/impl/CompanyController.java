package com.berksozcu.controller.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.service.impl.CompanyServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rest/api/company")
public class CompanyController {
    @Autowired
    private CompanyServiceImpl companyService;

    @PostMapping("/create")
    public ResponseEntity<?> createCompany(@RequestBody Map<String, String> request) {
        String schemaName = request.get("id"); // React'teki newCompData.id
        String companyName = request.get("name");
        String description = request.get("desc");
        String sourceSchema = request.get("sourceSchema");
        if(companyName == null || companyName.isEmpty() || schemaName == null || schemaName.isEmpty()) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_HATA));
        }

        if(sourceSchema == null || sourceSchema.isEmpty()) {
            sourceSchema = "logo";
        }

        try {
            companyService.createNewTenantSchema(schemaName, companyName, description, sourceSchema);
            return ResponseEntity.ok("Şema '" + schemaName + "' başarıyla oluşturuldu.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Şema oluşturma hatası: " + e.getMessage());
        }
    }

    @GetMapping("/find-all")
    public List<Company> findAllCompany() {
       return companyService.getAllCompanies();
    }

}
