package com.berksozcu.repository;

import com.berksozcu.entites.sales.SalesInvoice;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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
}
