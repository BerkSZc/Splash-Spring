package com.berksozcu.xml.controller;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.xml.service.XmlImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/rest/api/import")
@RateLimit(capacity = 100)
public class XmlImportController {

    @Autowired
    private XmlImportService importService;

    @PostMapping("/invoice")
    public ResponseEntity<?> importPurchaseInvoices(@RequestParam("file") MultipartFile file,
                                                    @RequestParam String schemaName,
                                                    @RequestParam InvoiceType type) {
        try {
            importService.importInvoices(file, schemaName, type);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

//    @PostMapping("/purchase-invoice")
//    public ResponseEntity<?> importPurchaseInvoices(@RequestParam("file") MultipartFile file,
//    @RequestParam String schemaName) {
//        try {
//            importService.importPurchaseInvoices(file, schemaName);
//            return ResponseEntity.ok("XML başarıyla aktarıldı!");
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
//        }
//    }
//
//    @PostMapping("/sales-invoice")
//    public ResponseEntity<?> importSalesInvoices(@RequestParam MultipartFile file,
//                                                 @RequestParam String schemaName) {
//        try {
//            importService.importSalesInvoices(file, schemaName);
//            return ResponseEntity.ok("XML başarıyla aktarıldı!");
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
//        }
//    }

    @PostMapping("/materials")
    public ResponseEntity<?> importMaterials(@RequestParam("file") MultipartFile file,
                                             @RequestParam String schemaName) {
        try {
            importService.importMaterials(file, schemaName);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @PostMapping("/materials-purchase-price")
    public ResponseEntity<?> importMaterialsPurchasePrice(@RequestParam("file") MultipartFile file,
                                             @RequestParam String schemaName) {
        try {
            importService.importMaterialsPurchasePrice(file, schemaName);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @PostMapping("/materials-sales-price")
    public ResponseEntity<?> importMaterialsSalesPrice(@RequestParam("file") MultipartFile file,
                                             @RequestParam String schemaName) {
        try {
            importService.importMaterialsSalesPrice(file, schemaName);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @PostMapping("/customers")
    public ResponseEntity<?> importCustomers(@RequestParam("file") MultipartFile file,
                                             @RequestParam String schemaName) {
        try {
            importService.importCustomers(file, schemaName);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @PostMapping("/collections")
    public ResponseEntity<?> importCollections(@RequestParam("file") MultipartFile file,
                                               @RequestParam String schemaName) {
        try {
            importService.importCollections(file, schemaName);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @PostMapping("/payrolls")
    public ResponseEntity<?> importPayrolls(@RequestParam("file") MultipartFile file,
                                            @RequestParam String schemaName) {
        try {
            importService.importPayrolls(file, schemaName);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @PostMapping("/vouchers")
    public ResponseEntity<?> importVouchers(@RequestParam("file") MultipartFile file,
                                            @RequestParam String schemaName) {
        try {
            importService.importOpeningVouchers(file, schemaName);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }


}
