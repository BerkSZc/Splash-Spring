package com.berksozcu.xml.controller;

import com.berksozcu.controller.IXmlController;
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
public class XmlImportController implements IXmlController {

    @Autowired
    private XmlImportService importService;

    @Override
    @PostMapping("/purchase-invoice")
    public ResponseEntity<?> importPurchaseInvoices(@RequestParam("file") MultipartFile file) {
        try {
            importService.importPurchaseInvoices(file);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @Override
    @PostMapping("/sales-invoice")
    public ResponseEntity<?> importSalesInvoices(MultipartFile file) {
        try {
            importService.importSalesInvoices(file);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @Override
    @PostMapping("/materials")
    public ResponseEntity<?> importMaterials(@RequestParam("file") MultipartFile file) {
        try {
            importService.importMaterials(file);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @Override
    @PostMapping("/customers")
    public ResponseEntity<?> importCustomers(@RequestParam("file") MultipartFile file) {
        try {
            importService.importCustomers(file);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @Override
    @PostMapping("/collections")
    public ResponseEntity<?> importCollections(@RequestParam("file") MultipartFile file) {
        try {
            importService.importCollections(file);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @Override
    @PostMapping("/payrolls")
    public ResponseEntity<?> importPayrolls(@RequestParam("file") MultipartFile file) {
        try {
            importService.importPayrolls(file);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }

    @Override
    @PostMapping("/vouchers")
    public ResponseEntity<?> importVouchers(@RequestParam("file") MultipartFile file) {
        try {
            importService.importOpeningVouchers(file);
            return ResponseEntity.ok("XML başarıyla aktarıldı!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }


}
