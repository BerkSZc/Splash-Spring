package com.berksozcu.controller.impl;

import com.berksozcu.controller.IPurchaseInvoiceController;
import com.berksozcu.entites.PurchaseInvoice;
import com.berksozcu.service.IPurchaseInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/api/purchase")
public class PurchaseInvoiceControllerControllerImpl implements IPurchaseInvoiceController {

    @Autowired
    private IPurchaseInvoiceService purchaseInvoice;


    @Override
    @PostMapping("/add/{id}")
    public PurchaseInvoice addPurchaseInvoice(@PathVariable(name = "id") Long id, @RequestBody PurchaseInvoice newPurchaseInvoice) {
        return purchaseInvoice.addPurchaseInvoice(id, newPurchaseInvoice);
    }
}
