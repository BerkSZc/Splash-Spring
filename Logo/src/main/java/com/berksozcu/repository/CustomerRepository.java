package com.berksozcu.repository;

import com.berksozcu.entites.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByArchivedFalse();

    List<Customer> findByArchivedTrue();

    Optional<Customer> findByCode(String name);
}
