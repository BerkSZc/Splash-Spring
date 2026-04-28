package com.berksozcu.repository;

import com.berksozcu.entites.company.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Company findBySchemaName(String schemaName);

    boolean existsBySchemaName(String schemaName);

    @Query(value = "SELECT schema_name FROM splash.company WHERE schema_name LIKE 'splash\\_%' ORDER BY CAST(SPLIT_PART(schema_name, '_', 2) AS INTEGER) DESC LIMIT 1", nativeQuery = true)
    String findMaxSchemaName();
}
