package com.berksozcu.repository;

import com.berksozcu.entites.sales.SalesInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

public interface SalesInvoiceItemRepository extends JpaRepository<SalesInvoiceItem, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM SalesInvoiceItem ssi WHERE ssi.salesInvoice.company.id = :companyId AND ssi.salesInvoice.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(@Param("companyId") Long companyId,
                                         @Param("start")LocalDate start,
                                         @Param("end") LocalDate end);
}
