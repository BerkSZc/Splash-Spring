package com.berksozcu.repository;

import com.berksozcu.entites.payroll.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByTransactionDateBetween(LocalDate start, LocalDate end);

    boolean existsByFileNo(String fileNo);
}
