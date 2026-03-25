package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaterialPriceHistoryRepository extends JpaRepository<MaterialPriceHistory, Long> {

    //Fatura tipine göre belli bir malzemenin liste şeklinde mali yıl içinde
    // fiyat geçmişine bakmak için kullanılır.
    List<MaterialPriceHistory> findByMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(
            Long materialId, InvoiceType invoiceType, Company company,LocalDate start, LocalDate end);

   //Fatura tipine göre belli bir malzemenin liste şeklinde tüm yıllar içinde
   // fiyat geçmişine bakmak için kullanılır.
   List<MaterialPriceHistory> findByMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(
            Long materialId, Company company, InvoiceType invoiceType
   );

    //Fatura tipine göre ve Müşteriye göre belli bir malzemenin liste şeklinde mali yıl içinde
    // fiyat geçmişine bakmak için kullanılır.
   List<MaterialPriceHistory> findByCustomerIdAndMaterialIdAndInvoiceTypeAndCompanyAndDateBetweenOrderByDateDesc(
           Long customerId, Long materialId, InvoiceType invoiceType, Company company, LocalDate start, LocalDate end
   );

   //Fatura tipine göre ve Müşteriye göre belli bir malzemenin liste şeklinde tüm yıllar içinde
    // fiyat geçmişine bakmak için kullanılır.
   List<MaterialPriceHistory> findByCustomerIdAndMaterialIdAndCompanyAndInvoiceTypeOrderByDateDesc(
           Long customerId, Long materialId, Company company, InvoiceType invoiceType
   );

    void deleteByMaterialIdAndInvoiceIdAndCompany(Long material, Long invoiceId, Company company);

    void deleteByMaterialIdAndCompany(Long materialId, Company company);
}
