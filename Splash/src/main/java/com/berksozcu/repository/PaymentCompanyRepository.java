package com.berksozcu.repository;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentCompanyRepository extends JpaRepository<PaymentCompany, Long> {

    List<PaymentCompany> findAllByCompanyAndDateBetween(Company company, LocalDate start, LocalDate end);

    boolean existsByFileNoAndCompany(String fileNo, Company company);

    @Query("SELECT MAX(p.fileNo) FROM PaymentCompany p " +
            "WHERE p.date BETWEEN :start AND :end " +
            "AND p.fileNo LIKE 'ODEME%' AND " +
            "p.company = :company ")
    String findMaxFileNoByYearAndCompany(@Param("start") LocalDate start,
                               @Param("end") LocalDate end,
                               @Param("company") Company company);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM PaymentCompany py WHERE py.company.id = :companyId AND py.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(@Param("companyId") Long companyId,
                                         @Param("start") LocalDate start,
                                         @Param("end") LocalDate end);

    @Query("SELECT p FROM PaymentCompany p WHERE p.company = :company " +
            "AND p.date BETWEEN :start AND :end " +
            "AND (:search IS NULL OR :search = '' " +
            "OR LOWER(p.fileNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PaymentCompany> findByCompanyAndSearchAndDateBetween(Company company, String search, LocalDate start, LocalDate end,
                                                     Pageable pageable);
    Optional<PaymentCompany> findByIdAndCompany(Long id, Company company);

    List<PaymentCompany> findAllByCompany(Company company);
}
