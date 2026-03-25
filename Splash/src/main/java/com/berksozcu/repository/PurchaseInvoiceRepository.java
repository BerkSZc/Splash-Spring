package com.berksozcu.repository;

import com.berksozcu.dto.report.DtoMonthlyKdv;
import com.berksozcu.entites.company.Company;
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
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {
    //    @Query(value = "SELECT * FROM PurchaseInvoiceRepository WHERE id=?",nativeQuery = true)
    List<PurchaseInvoice> findAllByCustomerId(Long id);

    boolean existsByFileNoAndCompany(String fileNo, Company company);

    List<PurchaseInvoice> findAllByCompanyAndDateBetween(Company company, LocalDate start, LocalDate end);

    @Query("SELECT MAX(p.fileNo) FROM PurchaseInvoice p " +
            "WHERE p.date BETWEEN :start AND :end AND " +
            " p.fileNo LIKE 'ALIS%' AND " +
            " p.company = :company ")
    String findMaxFileNoByYearAndCompany(@Param("start") LocalDate start
            , @Param("end") LocalDate end, @Param("company") Company company);

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


    @Query("SELECT p FROM PurchaseInvoice p WHERE p.company = :company " +
            "AND p.date BETWEEN :start AND :end " +
            "AND (:search IS NULL OR :search = '' " +
            "OR LOWER(p.fileNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PurchaseInvoice> findByCompanyAndSearchAndDateBetween(Company company, String search, LocalDate start, LocalDate end,
                                                      Pageable pageable);

    Optional<PurchaseInvoice> findByIdAndCompany(Long id, Company company);
}
