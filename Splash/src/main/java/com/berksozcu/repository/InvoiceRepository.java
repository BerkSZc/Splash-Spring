package com.berksozcu.repository;

import com.berksozcu.dto.report.MonthlyKdvDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.invoice.Invoice;
import com.berksozcu.entites.material_price_history.InvoiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
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
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    //    @Query(value = "SELECT * FROM PurchaseInvoiceRepository WHERE id=?",nativeQuery = true)
    List<Invoice> findAllByCustomerIdAndInvoiceType(Long id, InvoiceType type);

    boolean existsByFileNoAndCompany(String fileNo, Company company);

    List<Invoice> findAllByCompanyAndDateBetweenAndInvoiceType(Company company, LocalDate start, LocalDate end, InvoiceType type);

    @Query("SELECT MAX(p.fileNo) FROM Invoice p " +
            "WHERE p.date BETWEEN :start AND :end AND " +
            "p.invoiceType = :type AND " +
            "p.fileNo LIKE :prefix AND " +
            "p.company = :company ")
    String findMaxFileNoByYearAndCompanyAndType(@Param("start") LocalDate start
            , @Param("end") LocalDate end, @Param("company") Company company,
                                                InvoiceType type,
                                                @Param("prefix") String prefix);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Invoice p WHERE p.company.id = :companyId AND " +
            "p.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(Long companyId, LocalDate start, LocalDate end);

    @Query("SELECT new com.berksozcu.dto.report.MonthlyKdvDto(" +
            "MONTH(pi.date), YEAR(pi.date), SUM(pi.totalPrice - pi.kdvToplam), SUM(pi.kdvToplam), SUM(pi.totalPrice)) " +
            "FROM Invoice pi " +
            "WHERE YEAR(pi.date) = :year AND pi.company.id = :companyId AND pi.invoiced = true " +
            "AND pi.invoiceType = :type " +
            "GROUP BY MONTH(pi.date), YEAR(pi.date) " +
            "ORDER BY MONTH(pi.date)")
    List<MonthlyKdvDto> getMonthlyChangeByType(@Param("year") int year, @Param("companyId") Long companyId, InvoiceType type);


    @Query("""
    SELECT p FROM Invoice p
    WHERE p.company = :company
      AND p.date BETWEEN :start AND :end
      AND p.invoiceType = :type
      AND (
          :search IS NULL OR :search = ''
          OR LOWER(
              TRANSLATE(
                  p.fileNo,
                  'İIıĞğÜüŞşÖöÇç',
                  'IIiGgUuSsOoCc'
              )
          ) LIKE :search
          OR LOWER(
              TRANSLATE(
                  p.customer.name,
                  'İIıĞğÜüŞşÖöÇç',
                  'IIiGgUuSsOoCc'
              )
          ) LIKE :search
      )
    """)
    Page<Invoice> findByCompanyAndSearchAndDateBetweenAndType(Company company, String search, LocalDate start, LocalDate end,
                                                               Pageable pageable, InvoiceType type);

    @Query("""
    SELECT p FROM Invoice p
    WHERE p.company = :company
      AND p.date BETWEEN :start AND :end
      AND (
          :search IS NULL OR :search = ''
          OR LOWER(
              TRANSLATE(
                  p.fileNo,
                  'İIıĞğÜüŞşÖöÇç',
                  'IIiGgUuSsOoCc'
              )
          ) LIKE :search
          OR LOWER(
              TRANSLATE(
                  p.customer.name,
                  'İIıĞğÜüŞşÖöÇç',
                  'IIiGgUuSsOoCc'
              )
          ) LIKE :search
      )
    """)
    Page<Invoice> findByCompanyAndSearchAndDateBetween(Company company, String search, LocalDate start, LocalDate end,
                                                               Pageable pageable);

    Optional<Invoice> findByIdAndCompanyAndInvoiceType(Long id, Company company,  InvoiceType type);

    Optional<Invoice> findByIdAndCompany(Long id, Company company);

    @Query(
            value = "SELECT i.id FROM Invoice i " +
                    "WHERE i.company = :company " +
                    "AND i.customer.id = :customerId " +
                    "AND (:invoiceType IS NULL OR CAST(i.invoiceType AS string) = :invoiceType) " +
                    "AND (:search IS NULL OR LOWER(i.fileNo) LIKE :search OR LOWER(i.customer.name) LIKE :search)",

            countQuery = "SELECT COUNT(i) FROM Invoice i " +
                    "WHERE i.company = :company " +
                    "AND i.customer.id = :customerId " +
                    "AND (:invoiceType IS NULL OR CAST(i.invoiceType AS string) = :invoiceType) " +
                    "AND (:search IS NULL OR LOWER(i.fileNo) LIKE :search OR LOWER(i.customer.name) LIKE :search)"
    )
    Page<Long> findInvoiceIdsByCustomerId(
            @Param("company") Company company,
            @Param("customerId") Long customerId,
            @Param("search") String search,
            @Param("invoiceType") String invoiceType,
            Pageable pageable
    );

    @Query(
            "SELECT DISTINCT i FROM Invoice i " +
                    "LEFT JOIN FETCH i.items " +
                    "LEFT JOIN FETCH i.customer " +
                    "WHERE i.id IN :ids " +
                    "ORDER BY i.date DESC"
    )
    List<Invoice> findAllByIdInWithItems(@Param("ids") List<Long> ids);
}
