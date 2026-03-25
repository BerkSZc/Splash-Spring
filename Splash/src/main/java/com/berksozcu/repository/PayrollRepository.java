package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.payroll.PayrollType;
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
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByCompanyAndTransactionDateBetween(Company company, LocalDate start, LocalDate end);

    boolean existsByFileNoAndCompany(String fileNo, Company company);

    @Query("SELECT MAX(p.fileNo) FROM Payroll p WHERE p.transactionDate BETWEEN :start AND :end " +
            "AND p.payrollModel = :model " +
            "AND p.payrollType = :type " +
            "AND p.fileNo LIKE :prefix " +
            "AND p.company = :company " )
    String findMaxFileNoByYearAndModelAndTypeAndCompany(@Param("start") LocalDate start,
                                              @Param("end") LocalDate end,
                                              @Param("model") PayrollModel model,
                                              @Param("type") PayrollType type,
                                              @Param("prefix") String prefix,
                                              @Param("company") Company company);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Payroll pyr WHERE pyr.company.id = :companyId AND pyr.transactionDate BETWEEN :start AND :end")
    void deleteByCompanyIdAndTransactionDateBetween(Long companyId, LocalDate start, LocalDate end);

    @Query("SELECT p FROM Payroll p WHERE p.company = :company " +
            "AND p.transactionDate BETWEEN :start AND :end " +
            "AND (:search IS NULL OR :search = '' " +
            "OR LOWER(p.fileNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.bankName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.bankBranch) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Payroll> findByCompanyAndSearchAndTransactionDateBetween(Company company, String search, LocalDate start, LocalDate end,
                                                         Pageable pageable);

    Optional<Payroll> findByIdAndCompany(Long id, Company company);

    List<Payroll> findAllByCompany(Company company);
}
