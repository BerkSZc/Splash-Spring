package com.berksozcu.service;

import com.berksozcu.dto.customer.DtoCustomer;
import com.berksozcu.entites.customer.Customer;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICustomerService {

     Customer addCustomer(DtoCustomer newCustomer, int year, String schemaName);

     Page<Customer> getAllCustomer(int page, int size, Boolean archived, String search, String schemaName);

     void updateCustomer(Long id, DtoCustomer updateCustomer, int currentYear, String schemaName);

    List<Customer> findByArchivedTrue();

    List<Customer> findByArchivedFalse();

    void setArchived(List<Long> ids, boolean archived, String schemaName);
}
