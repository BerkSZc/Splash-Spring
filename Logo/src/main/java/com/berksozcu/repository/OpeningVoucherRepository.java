package com.berksozcu.repository;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpeningVoucherRepository extends JpaRepository<OpeningVoucher, Long> {

    Optional<OpeningVoucher> findByCustomerIdAndDate(Long customerId, LocalDate date);

    Optional<OpeningVoucher> findByCustomerIdAndDateBetween(Long customerId, LocalDate start, LocalDate end);

    List<OpeningVoucher> findAllByCustomerIdAndDateBetween(Long customerId, LocalDate start, LocalDate end);

}
