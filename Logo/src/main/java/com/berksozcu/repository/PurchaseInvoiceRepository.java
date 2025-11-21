package com.berksozcu.repository;

import com.berksozcu.entites.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {
//    @Query(value = "SELECT * FROM PurchaseInvoiceRepository WHERE id=?",nativeQuery = true)
    public List<PurchaseInvoice> findAllByCustomerId(Long id);
}
