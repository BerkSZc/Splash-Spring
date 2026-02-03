package com.berksozcu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

public interface IXmlController {

     ResponseEntity<?> importPurchaseInvoices(@RequestParam("file") MultipartFile file, String schemaName);

     ResponseEntity<?> importSalesInvoices(@RequestParam("file") MultipartFile file, String schemaName);

     ResponseEntity<?> importMaterials(@RequestParam("file") MultipartFile file);

     ResponseEntity<?> importCustomers(@RequestParam("file") MultipartFile file);

     ResponseEntity<?> importCollections(@RequestParam("file") MultipartFile file, String schemaName);

     ResponseEntity<?> importPayrolls(@RequestParam("file") MultipartFile file, String schemaName);

     ResponseEntity<?> importVouchers(@RequestParam("file") MultipartFile file);

}
