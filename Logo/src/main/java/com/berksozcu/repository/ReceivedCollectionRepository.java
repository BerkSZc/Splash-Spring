package com.berksozcu.repository;

import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReceivedCollectionRepository extends JpaRepository<ReceivedCollection, Long> {
    List<ReceivedCollection> findByDateBetween(LocalDate start, LocalDate end);

    List<ReceivedCollection> findAllByDateBetween(LocalDate start, LocalDate end);
}
