package com.berksozcu.repository;

import com.berksozcu.dto.report.DtoMonthlyKdv;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {
//    @Query(value = "SELECT * FROM PurchaseInvoiceRepository WHERE id=?",nativeQuery = true)
    List<PurchaseInvoice> findAllByCustomerId(Long id);

    List<PurchaseInvoice> findByDateBetween(LocalDate start, LocalDate end);

    boolean existsByFileNo(String fileNo);

    List<PurchaseInvoice> findAllByDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT MAX(p.fileNo) FROM PurchaseInvoice p WHERE p.date BETWEEN :start AND :end AND p.fileNo LIKE 'ALIS%'")
    String findMaxFileNoByYear(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM PurchaseInvoice p WHERE p.company.id = :companyId AND p.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(Long companyId, LocalDate start, LocalDate end);

    @Query("SELECT new com.berksozcu.dto.report.DtoMonthlyKdv(" +
            "MONTH(pi.date), YEAR(pi.date), SUM(pi.totalPrice - pi.kdvToplam), SUM(pi.kdvToplam), SUM(pi.totalPrice)) " +
            "FROM PurchaseInvoice pi " +
            "WHERE YEAR(pi.date) = :year AND pi.company.id = :companyId " +
            "GROUP BY MONTH(pi.date), YEAR(pi.date) " +
            "ORDER BY MONTH(pi.date)")
    List<DtoMonthlyKdv> getMonthlyPurchases(@Param("year") int year, @Param("companyId") Long companyId);
}
