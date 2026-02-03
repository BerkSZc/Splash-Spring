package com.berksozcu.repository;

import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Repository
public interface PurchaseInvoiceItemRepository extends JpaRepository<PurchaseInvoiceItem, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM PurchaseInvoiceItem pii WHERE pii.purchaseInvoice.company.id = :companyId AND pii.purchaseInvoice.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(@Param("companyId") Long companyId,
                                         @Param("start")LocalDate start,
                                         @Param("end") LocalDate end);
}
