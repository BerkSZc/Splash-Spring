package com.berksozcu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

public interface IXmlController {

    public ResponseEntity<?> importInvoice(@RequestParam("file") MultipartFile file);

    public ResponseEntity<?> importMaterials(@RequestParam("file") MultipartFile file);

    public ResponseEntity<?> importCustomers(@RequestParam("file") MultipartFile file);

    public ResponseEntity<?> importCollections(@RequestParam("file") MultipartFile file);
}
