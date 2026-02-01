package com.berksozcu.repository;

import com.berksozcu.entites.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByArchivedFalse();

    List<Customer> findByArchivedTrue();

    Optional<Customer> findByCode(String name);

    @Modifying
    @Query("UPDATE Customer c SET c.archived = :status WHERE c.id IN :ids")
    void updateArchivedStatus(@Param("ids") List<Long> ids, @Param("status") boolean status);

    boolean existsByCode(String code);
}
