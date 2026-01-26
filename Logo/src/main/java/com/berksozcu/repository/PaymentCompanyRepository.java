package com.berksozcu.repository;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentCompanyRepository extends JpaRepository<PaymentCompany, Long> {
    List<PaymentCompany> findByDateBetween(LocalDate start, LocalDate end);

    List<PaymentCompany> findAllByDateBetween(LocalDate start, LocalDate end);
}
