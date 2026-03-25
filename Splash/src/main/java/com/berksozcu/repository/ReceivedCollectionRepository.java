package com.berksozcu.repository;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.company.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface
ReceivedCollectionRepository extends JpaRepository<ReceivedCollection, Long> {

    List<ReceivedCollection> findAllByCompanyAndDateBetween(Company company, LocalDate start, LocalDate end);

    boolean existsByFileNoAndCompany(String fileNo, Company company);

    @Query("SELECT MAX(p.fileNo) FROM ReceivedCollection p " +
            "WHERE p.date BETWEEN :start AND " +
            " :end AND p.fileNo LIKE 'TAH%' AND " +
            "p.company = :company ")
    String findMaxFileNoByYearAndCompany(@Param("start") LocalDate start
            , @Param("end") LocalDate end,
             @Param("company") Company company);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM ReceivedCollection rc WHERE rc.company.id = :companyId AND rc.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(Long companyId, LocalDate start, LocalDate end);

    @Query("SELECT r FROM ReceivedCollection r WHERE r.company = :company " +
            "AND r.date BETWEEN :start AND :end " +
            "AND (:search IS NULL OR :search = '' " +
            "OR LOWER(r.fileNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(r.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ReceivedCollection> findByCompanyAndSearchAndDateBetween(Company company, String search, LocalDate start, LocalDate end,
                                                         Pageable pageable);

    Optional<ReceivedCollection> findByIdAndCompany(Long id, Company company);

    List<ReceivedCollection> findAllByCompany(Company company);
}
