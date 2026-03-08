package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material.Material;
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
                              @Param("company")  Company company);
}
