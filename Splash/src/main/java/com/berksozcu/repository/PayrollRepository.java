package com.berksozcu.repository;

import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.payroll.PayrollType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByTransactionDateBetween(LocalDate start, LocalDate end);

    boolean existsByFileNo(String fileNo);

    @Query("SELECT MAX(p.fileNo) FROM Payroll p WHERE p.transactionDate BETWEEN :start AND :end " +
            "AND p.payrollModel = :model " +
            "AND p.payrollType = :type " +
            "AND p.fileNo LIKE :prefix")
    String findMaxFileNoByYearAndModelAndType(@Param("start") LocalDate start,
                                              @Param("end") LocalDate end,
                                              @Param("model") PayrollModel model,
                                              @Param("type") PayrollType type,
                                              @Param("prefix") String prefix);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Payroll pyr WHERE pyr.company.id = :companyId AND pyr.transactionDate BETWEEN :start AND :end")
    void deleteByCompanyIdAndTransactionDateBetween(Long companyId, LocalDate start, LocalDate end);
}
