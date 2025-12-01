package com.berksozcu.controller.impl;

import com.berksozcu.controller.ICustomerController;
import com.berksozcu.controller.base.RestBaseController;
import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.entites.Customer;
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
    public RootEntity<Customer> addCustomer(@RequestBody Customer customer) {
        return
                ok(customerService.addCustomer(customer));
    }

    @Override
    @GetMapping("/list")
    public RootEntity<List<Customer>> getAllCustomer(){
        return listOk(customerService.getAllCustomer());
    }

    @Override
    @PutMapping("/update-customer/{id}")
    public void updateCustomer(@PathVariable(name = "id") Long id, @RequestBody Customer updateCustomer) {
        customerService.updateCustomer(id, updateCustomer);
    }
}
