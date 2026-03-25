package com.berksozcu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface IXmlController {

     ResponseEntity<?> importPurchaseInvoices(MultipartFile file, String schemaName);

     ResponseEntity<?> importSalesInvoices(MultipartFile file, String schemaName);

     ResponseEntity<?> importMaterials(MultipartFile file, String schemaName);

     ResponseEntity<?> importMaterialsPurchasePrice(MultipartFile file, String schemaName);

     ResponseEntity<?> importMaterialsSalesPrice( MultipartFile file, String schemaName);

     ResponseEntity<?> importCustomers(MultipartFile file, String schemaName);

     ResponseEntity<?> importCollections(MultipartFile file, String schemaName);

     ResponseEntity<?> importPayrolls(MultipartFile file, String schemaName);

     ResponseEntity<?> importVouchers(MultipartFile file, String schemaName);

}
