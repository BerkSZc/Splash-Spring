package com.berksozcu.repository;

import com.berksozcu.entites.collections.Collection;
import com.berksozcu.entites.collections.CollectionType;
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
public interface CollectionRepository extends JpaRepository<Collection, Long> {

    List<Collection> findAllByCompanyAndDateBetweenAndType(Company company, LocalDate start, LocalDate end, CollectionType type);

    boolean existsByFileNoAndCompanyAndType(String fileNo, Company company, CollectionType type);

    @Query("SELECT MAX(c.fileNo) FROM Collection c " +
            "WHERE c.date BETWEEN :start AND " +
            " :end AND c.fileNo LIKE 'TAH%' AND " +
            "c.company = :company AND c.type = :type ")
    String findMaxFileNoByYearAndCompanyAndType(@Param("start") LocalDate start,
                                                @Param("end") LocalDate end,
                                                @Param("company") Company company,
                                                @Param("type") CollectionType type);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Collection c WHERE c.company.id = :companyId AND c.date BETWEEN :start AND :end")
    void deleteByCompanyIdAndDateBetween(Long companyId,
                                                LocalDate start,
                                                LocalDate end);

    @Query("SELECT c FROM Collection c WHERE c.company = :company " +
            "AND c.date BETWEEN :start AND :end " +
            "AND c.type = :type " +
            "AND (:search IS NULL OR :search = '' " +
            "OR LOWER(c.fileNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(c.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Collection> findByCompanyAndSearchAndDateBetweenAndType(Company company,
                                                                 String search,
                                                                 LocalDate start,
                                                                 LocalDate end,
                                                                  Pageable pageable,
                                                                 CollectionType type);

    @Query("SELECT c FROM Collection c WHERE c.company = :company " +
            "AND c.date BETWEEN :start AND :end " +
            "AND (:search IS NULL OR :search = '' " +
            "OR LOWER(c.fileNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(c.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Collection> findByCompanyAndSearchAndDateBetween(Company company,
                                                                 String search,
                                                                 LocalDate start,
                                                                 LocalDate end,
                                                                  Pageable pageable);

    Optional<Collection> findByIdAndCompany(Long id, Company company);

    Optional<Collection> findByIdAndCompanyAndType(Long id, Company company, CollectionType type);

    List<Collection> findAllByCompanyAndType(Company company,  CollectionType type);
}
