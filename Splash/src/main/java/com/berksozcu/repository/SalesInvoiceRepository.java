package com.berksozcu.repository;

import com.berksozcu.dto.report.DtoMonthlyKdv;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.sales.SalesInvoice;
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
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {

    List<SalesInvoice> findAllByCompanyAndDateBetween(Company company, LocalDate start, LocalDate end);

    boolean existsByFileNoAndCompany(String fileNo, Company company);

    @Query(value = "SELECT MAX(s.fileNo) FROM SalesInvoice s " +
            "WHERE s.date BETWEEN :start AND :end AND " +
            " s.fileNo LIKE 'SOZ%' AND " +
            " s.company = :company " )
    String findMaxFileNoByYearAndCompany(LocalDate start, LocalDate end, Company company);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM SalesInvoice s WHERE s.company.id = :companyId AND s.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(Long companyId, LocalDate start, LocalDate end);

    @Query("SELECT new com.berksozcu.dto.report.DtoMonthlyKdv(" +
            "MONTH(si.date), YEAR(si.date), SUM(si.totalPrice - si.kdvToplam), SUM(si.kdvToplam), SUM(si.totalPrice)) " +
            "FROM SalesInvoice si " +
            "WHERE YEAR(si.date) = :year AND si.company.id = :companyId " +
            "GROUP BY MONTH(si.date), YEAR(si.date) " +
            "ORDER BY MONTH(si.date)")
    List<DtoMonthlyKdv> getMonthlySales(@Param("year") int year, @Param("companyId") Long companyId);

    @Query("SELECT s FROM SalesInvoice s WHERE s.company = :company " +
            "AND s.date BETWEEN :start AND :end " +
            "AND (:search IS NULL OR :search = '' " +
            "OR LOWER(s.fileNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(s.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<SalesInvoice> findByCompanyAndSearchAndDateBetween(Company company, String search, LocalDate start, LocalDate end, Pageable pageable);

    Optional<SalesInvoice> findByIdAndCompany(Long id, Company company);
}
