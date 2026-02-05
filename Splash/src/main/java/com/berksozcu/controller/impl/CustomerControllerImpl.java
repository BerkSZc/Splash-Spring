package com.berksozcu.controller.impl;

import com.berksozcu.controller.ICustomerController;
import com.berksozcu.controller.base.RestBaseController;
import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.service.ICustomerService;
import com.berksozcu.service.IPurchaseInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/customer")
public class CustomerControllerImpl extends RestBaseController implements ICustomerController {

    @Autowired
    private ICustomerService customerService;

    @Autowired
    private IPurchaseInvoiceService purchaseInvoice;

    @Override
    @GetMapping("/{id}")
    public RootEntity<Customer> findCustomerById(@PathVariable(name = "id") Long id) {
        return ok(customerService.findCustomerById(id));
    }

    @Override
    @PostMapping("/add-customer")
    public RootEntity<Customer> addCustomer(@RequestBody DtoCustomer customer,
    @RequestParam int year, @RequestParam String schemaName) {
        return
                ok(customerService.addCustomer(customer, year, schemaName));
    }

    @Override
    @GetMapping("/list")
    public RootEntity<List<Customer>> getAllCustomer(){
        return listOk(customerService.getAllCustomer());
    }

    @Override
    @PutMapping("/update-customer/{id}")
    public void updateCustomer(@PathVariable(name = "id") Long id, @RequestBody DtoCustomer updateCustomer,
    @RequestParam int currentYear, @RequestParam String schemaName) {
        customerService.updateCustomer(id, updateCustomer, currentYear, schemaName);
    }

    @Override
    @PostMapping("/archive")
    public void setArchived(@RequestBody List<Long> ids, @RequestParam boolean archived) {
        customerService.setArchived(ids, archived);
    }
}
