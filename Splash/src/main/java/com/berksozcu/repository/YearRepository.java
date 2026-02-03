package com.berksozcu.repository;


import com.berksozcu.entites.company.Year;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface YearRepository extends JpaRepository<Year, Long> {
    List<Year> findByCompanyIdOrderByYearValueDesc(Long companyId);

    boolean existsByYearValueAndCompanyId(Integer yearValue, Long companyId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Year y WHERE y.yearValue = :yearValue AND y.company.id = :companyId")
    void deleteYearValueByCompanyId(@Param("yearValue") Integer yearValue, @Param("companyId") Long companyId);
}
