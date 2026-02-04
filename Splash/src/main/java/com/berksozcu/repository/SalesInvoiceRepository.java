package com.berksozcu.repository;

import com.berksozcu.dto.report.DtoMonthlyKdv;
import com.berksozcu.entites.sales.SalesInvoice;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {
    List<SalesInvoice> findByDateBetween(LocalDate start, LocalDate end);

    List<SalesInvoice> findAllByDateBetween(LocalDate start, LocalDate end);

    boolean existsByFileNo(String fileNo);

    @Query(value = "SELECT MAX(s.fileNo) FROM SalesInvoice s WHERE s.date BETWEEN :start AND :end AND s.fileNo LIKE 'SOZ%'")
    String findMaxFileNoByYear(LocalDate start, LocalDate end);

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
}
