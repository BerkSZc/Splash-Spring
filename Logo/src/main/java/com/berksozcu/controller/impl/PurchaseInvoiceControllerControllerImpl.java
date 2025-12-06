package com.berksozcu.controller.impl;

import com.berksozcu.controller.IPurchaseInvoiceController;
import com.berksozcu.entites.PurchaseInvoice;
import com.berksozcu.service.IPurchaseInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @Override
    @GetMapping("/all-invoice/{id}")
    public List<PurchaseInvoice> findAllPurchaseInvoiceByCustomerId(@PathVariable(name = "id") Long id){
        return purchaseInvoice.findAllPurchaseInvoiceByCustomerId(id);
    }

    @Override
    @GetMapping("/all")
    public List<PurchaseInvoice> getAllPurchaseInvoice() {
        return purchaseInvoice.getAllPurchaseInvoice();
    }

    @Override
    @PutMapping("/update/{id}")
    public PurchaseInvoice editPurchaseInvoice(@PathVariable(name = "id") Long id, @RequestBody PurchaseInvoice newPurchaseInvoice) {
        return purchaseInvoice.editPurchaseInvoice(id, newPurchaseInvoice);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deletePurchaseInvoice(@PathVariable(name = "id") Long id) {
         purchaseInvoice.deletePurchaseInvoice(id);
    }
}
