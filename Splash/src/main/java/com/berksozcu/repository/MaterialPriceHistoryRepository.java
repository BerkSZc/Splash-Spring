package com.berksozcu.repository;

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
    List<MaterialPriceHistory> findByMaterialIdAndInvoiceTypeAndDateBetweenOrderByDateDesc(
            Long materialId, InvoiceType invoiceType, LocalDate start, LocalDate end);

   //Fatura tipine göre belli bir malzemenin liste şeklinde tüm yıllar içinde
   // fiyat geçmişine bakmak için kullanılır.
   List<MaterialPriceHistory> findByMaterialIdAndInvoiceTypeOrderByDateDesc(
            Long materialId, InvoiceType invoiceType
   );

    //Fatura tipine göre ve Müşteriye göre belli bir malzemenin liste şeklinde mali yıl içinde
    // fiyat geçmişine bakmak için kullanılır.
   List<MaterialPriceHistory> findByCustomerIdAndMaterialIdAndInvoiceTypeAndDateBetweenOrderByDateDesc(
           Long customerId, Long materialId, InvoiceType invoiceType, LocalDate start, LocalDate end
   );

   //Fatura tipine göre ve Müşteriye göre belli bir malzemenin liste şeklinde tüm yıllar içinde
    // fiyat geçmişine bakmak için kullanılır.
   List<MaterialPriceHistory> findByCustomerIdAndMaterialIdAndInvoiceTypeOrderByDateDesc(
           Long customerId, Long materialId, InvoiceType invoiceType
   );

    void deleteByMaterialIdAndInvoiceId(Long material, Long invoiceId);
}
