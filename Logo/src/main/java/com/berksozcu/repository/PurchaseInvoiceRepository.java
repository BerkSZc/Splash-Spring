package com.berksozcu.repository;

import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {
//    @Query(value = "SELECT * FROM PurchaseInvoiceRepository WHERE id=?",nativeQuery = true)
    List<PurchaseInvoice> findAllByCustomerId(Long id);

    List<PurchaseInvoice> findByDateBetween(LocalDate start, LocalDate end);

    boolean existsByFileNo(String fileNo);

    List<PurchaseInvoice> findAllByDateBetween(LocalDate start, LocalDate end);
}
