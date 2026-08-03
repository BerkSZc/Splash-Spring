package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.invoice.InvoiceItem;
import com.berksozcu.entites.material_price_history.InvoiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM InvoiceItem ssi WHERE ssi.invoice.company.id = :companyId" +
            " AND ssi.invoice.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(@Param("companyId") Long companyId,
                                                @Param("start") LocalDate start,
                                                @Param("end") LocalDate end);

    boolean existsByMaterialIdAndInvoice_CompanyAndInvoice_InvoiceType(Long materialId, Company company, InvoiceType type);

}
