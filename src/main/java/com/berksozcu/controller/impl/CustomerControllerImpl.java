package com.berksozcu.controller.impl;

import com.berksozcu.controller.ICustomerController;
import com.berksozcu.entites.Customer;
import com.berksozcu.service.ICustomerService;
import com.berksozcu.service.IPurchaseInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/customer")
public class CustomerControllerImpl implements ICustomerController {

    @Autowired
    private ICustomerService customerService;

    @Autowired
    private IPurchaseInvoiceService purchaseInvoice;

    @Override
    @GetMapping("/{id}")
    public Customer findCustomerById(@PathVariable(name = "id") Long id) {
        return customerService.findCustomerById(id);
    }

    @Override
    @PostMapping("/add-customer")
    public Customer addCustomer(@RequestBody Customer customer) {
        return customerService.addCustomer(customer);
    }

    @Override
    @GetMapping("/list")
    public List<Customer> getAllCustomer(){
        return customerService.getAllCustomer();
    }

    @Override
    @PutMapping("/update-customer/{id}")
    public void updateCustomer(@PathVariable(name = "id") Long id, @RequestBody Customer updateCustomer) {
        customerService.updateCustomer(id, updateCustomer);
    }
}
