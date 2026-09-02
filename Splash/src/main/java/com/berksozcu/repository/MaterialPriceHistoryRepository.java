package com.berksozcu.repository;

import com.berksozcu.dto.material_price_history.MaterialPriceHistoryDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaterialPriceHistoryRepository extends JpaRepository<MaterialPriceHistory, Long> {

    //Fatura tipine göre belli bir malzemenin liste şeklinde mali yıl içinde
    // fiyat geçmişine bakmak için kullanılır.
    @Query("""
        SELECT m FROM MaterialPriceHistory m
        WHERE m.company = :company
          AND m.material.id = :materialId
          AND m.invoiceType = :invoiceType
          AND m.date BETWEEN :start AND :end
          AND (
              :search IS NULL OR :search = ''
              OR LOWER(
                  TRANSLATE(
                      m.customer.name,
                      'İIıĞğÜüŞşÖöÇç',
                      'iiigguussoocc'
                  )
              ) LIKE :search
          )
        ORDER BY m.date DESC
    """)
    Page<MaterialPriceHistory> findByMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(
            Long materialId, InvoiceType invoiceType, Company company,LocalDate start, LocalDate end, String search, Pageable pageable);

   //Fatura tipine göre belli bir malzemenin liste şeklinde tüm yıllar içinde
   // fiyat geçmişine bakmak için kullanılır.
   @Query("""
        SELECT m FROM MaterialPriceHistory m
        WHERE m.company = :company
          AND m.material.id = :materialId
          AND m.invoiceType = :invoiceType
          AND (
              :search IS NULL OR :search = ''
              OR LOWER(
                  TRANSLATE(
                      m.customer.name,
                      'İIıĞğÜüŞşÖöÇç',
                      'iiigguussoocc'
                  )
              ) LIKE :search
          )
        ORDER BY m.date DESC
    """)
   Page<MaterialPriceHistory> findByMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(
            Long materialId, Company company, InvoiceType invoiceType, String search, Pageable pageable
   );

    //Fatura tipine göre ve Müşteriye göre belli bir malzemenin liste şeklinde mali yıl içinde
    // fiyat geçmişine bakmak için kullanılır.
    @Query("""
        SELECT m FROM MaterialPriceHistory m
        WHERE m.company = :company
          AND m.customer.id = :customerId
          AND m.material.id = :materialId
          AND m.invoiceType = :invoiceType
          AND m.date BETWEEN :start AND :end
          AND (
              :search IS NULL OR :search = ''
              OR LOWER(
                  TRANSLATE(
                      m.customer.name,
                      'İIıĞğÜüŞşÖöÇç',
                      'iiigguussoocc'
                  )
              ) LIKE :search
          )
        ORDER BY m.date DESC
    """)
   Page<MaterialPriceHistory> findByCustomerIdAndMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(
           Long customerId, Long materialId, InvoiceType invoiceType, Company company, LocalDate start, LocalDate end, String search, Pageable pageable
   );

   //Fatura tipine göre ve Müşteriye göre belli bir malzemenin liste şeklinde tüm yıllar içinde
    // fiyat geçmişine bakmak için kullanılır.
   @Query("""
        SELECT m FROM MaterialPriceHistory m
        WHERE m.company = :company
          AND m.customer.id = :customerId
          AND m.material.id = :materialId
          AND m.invoiceType = :invoiceType
          AND (
              :search IS NULL OR :search = ''
              OR LOWER(
                  TRANSLATE(
                      m.customer.name,
                      'İIıĞğÜüŞşÖöÇç',
                      'iiigguussoocc'
                  )
              ) LIKE :search
          )
        ORDER BY m.date DESC
    """)
   Page<MaterialPriceHistory> findByCustomerIdAndMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(
           Long customerId, Long materialId, Company company, InvoiceType invoiceType, String search, Pageable pageable
   );

    void deleteByMaterialIdAndInvoiceIdAndCompany(Long material, Long invoiceId, Company company);

    void deleteByMaterialIdAndCompany(Long materialId, Company company);
}
