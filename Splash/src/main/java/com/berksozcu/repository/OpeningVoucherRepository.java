package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.OpeningVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpeningVoucherRepository extends JpaRepository<OpeningVoucher, Long> {

    Optional<OpeningVoucher> findByCustomerIdAndCompanyAndDate(Long customerId, Company company, LocalDate date);

    Optional<OpeningVoucher> findByCustomerIdAndCompanyAndDateBetween(Long customerId, Company company, LocalDate start, LocalDate end);

    List<OpeningVoucher> findAllByCompanyAndDateBetween(Company company, LocalDate start, LocalDate end);

    void deleteByCompanyIdAndDateBetween(Long companyId, LocalDate start, LocalDate end);

    List<OpeningVoucher> findAllOpeningVoucherByDateBetweenAndCompanyIdOrderByDateDesc(LocalDate start, LocalDate end, Long companyId);
}
