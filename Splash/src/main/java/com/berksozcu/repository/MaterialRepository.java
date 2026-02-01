package com.berksozcu.repository;

import com.berksozcu.entites.material.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    Optional<Material> findByCode(@Param("value") String code);

    boolean existsByCode(String code);
}
