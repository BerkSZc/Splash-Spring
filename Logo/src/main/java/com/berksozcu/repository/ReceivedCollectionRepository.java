package com.berksozcu.repository;

import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface
ReceivedCollectionRepository extends JpaRepository<ReceivedCollection, Long> {
    List<ReceivedCollection> findByDateBetween(LocalDate start, LocalDate end);

    List<ReceivedCollection> findAllByDateBetween(LocalDate start, LocalDate end);

    boolean existsByFileNo(String fileNo);

    @Query("SELECT MAX(p.fileNo) FROM ReceivedCollection p WHERE p.date BETWEEN :start AND :end AND p.fileNo LIKE 'TAH%'")
    String findMaxFileNoByYear(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
