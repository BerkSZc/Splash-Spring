package com.berksozcu.controller.impl;

import com.berksozcu.controller.ICustomerController;
import com.berksozcu.controller.base.RestBaseController;
import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.service.ICustomerService;
import com.berksozcu.service.IPurchaseInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
    @PostMapping("/add-customer")
    public RootEntity<Customer> addCustomer(@RequestBody DtoCustomer customer,
                                            @RequestParam int year, @RequestParam String schemaName) {
        return
                ok(customerService.addCustomer(customer, year, schemaName));
    }

    @Override
    @GetMapping("/list")
    public RootEntity<Page<Customer>> getAllCustomer(
                    @RequestParam(defaultValue = "0") int page,
                    @RequestParam(defaultValue = "20") int size,
                    @RequestParam(required = false) Boolean archived,
                    @RequestParam(required = false) String search,
                    @RequestParam String schemaName) {
        return RootEntity.page(customerService.getAllCustomer(page, size, archived, search, schemaName));
    }

    @Override
    @PutMapping("/update-customer/{id}")
    public void updateCustomer(@PathVariable(name = "id") Long id, @RequestBody DtoCustomer updateCustomer,
                               @RequestParam int currentYear, @RequestParam String schemaName) {
        customerService.updateCustomer(id, updateCustomer, currentYear, schemaName);
    }

    @Override
    @PostMapping("/archive")
    public void setArchived(@RequestBody List<Long> ids, @RequestParam boolean archived,
                            @RequestParam String schemaName) {
        customerService.setArchived(ids, archived, schemaName);
    }
}
