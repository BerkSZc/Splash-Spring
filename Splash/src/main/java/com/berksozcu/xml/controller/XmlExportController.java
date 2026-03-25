package com.berksozcu.xml.controller;

import com.berksozcu.controller.base.RestBaseController;
import com.berksozcu.xml.service.XmlExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/api/export")
public class XmlExportController extends RestBaseController {

    @Autowired
    private XmlExportService xmlExportService;

    @GetMapping("/purchase-invoices")
    public ResponseEntity<byte[]> exportPurchaseInvoices(@RequestParam int year, @RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportPurchaseInvoices(year, schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/sales-invoices")
    public ResponseEntity<byte[]> exportSalesInvoices(@RequestParam int year, @RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportSalesInvoices(year, schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/materials")
    public ResponseEntity<byte[]> exportMaterials(@RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportMaterials(schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/materials-purchase-price")
    public ResponseEntity<byte[]> exportMaterialsPurchasePrice(@RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportMaterialsPurchasePrice(schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/materials-sales-price")
    public ResponseEntity<byte[]> exportMaterialsSalesPrice(@RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportMaterialsSalesPrice(schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/customers")
    public ResponseEntity<byte[]> exportCustomers(@RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportCustomers(schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/collections")
    public ResponseEntity<byte[]> exportCollections(@RequestParam int year, @RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportCollections(year, schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/payrolls")
    public ResponseEntity<byte[]> exportPayrolls(@RequestParam int year, @RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportPayrolls(year, schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/vouchers")
    public ResponseEntity<byte[]> exportOpeningVouchers(@RequestParam int year, @RequestParam String schemaName) {
        try {
            byte[] xmlContent = xmlExportService.exportOpeningVouchers(year, schemaName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export.xml")
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
