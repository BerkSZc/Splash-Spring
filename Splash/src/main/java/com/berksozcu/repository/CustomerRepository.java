package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    Optional<Customer> findByCodeAndCompany(String name, Company company);

    @Modifying
    @Query("UPDATE Customer c SET c.archived = :status WHERE c.id IN :ids AND c.company = :company")
    void updateArchivedStatus(@Param("ids") List<Long> ids, @Param("status") boolean status
            , @Param("company") Company company);

    boolean existsByCodeAndCompany(String code, Company company);

    List<Customer> findAllByCompany(Company company);

    @Query("SELECT c FROM Customer c WHERE c.company = :company " +
            "AND c.archived = :archived " +
            "AND (:search = '' OR :search IS NULL " +
            "OR LOWER(c.code) LIKE LOWER(:search) " +
            "OR LOWER(c.vdNo) LIKE LOWER(:search) " +
            "OR LOWER(c.name) LIKE LOWER(:search))")
    Page<Customer> findAllByCompanyAndArchivedAndSearch(Company company, boolean archived, String search, Pageable pageable);

    Optional<Customer> findByIdAndCompany(Long id, Company company);
}
