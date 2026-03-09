package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    Optional<Material> findByCode(@Param("value") String code);

    boolean existsByCodeAndCompany(String code, Company company);

    @Modifying
    @Query("UPDATE Material m SET m.archived = :status WHERE m.id IN :ids AND m.company = :company")
    void updateArchivedStatus(@Param("ids") List<Long> ids, @Param("status") boolean status,
                              @Param("company") Company company);

    @Query("SELECT m FROM Material m WHERE m.company = :company AND m.archived = :archived " +
            "AND (:search IS NULL OR LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(m.comment) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Material> findByCompanyAndArchivedWithSearch(
            @Param("company") Company company,
            @Param("archived") boolean archived,
            @Param("search") String search,
            Pageable pageable
    );
}
