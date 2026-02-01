package com.berksozcu.repository;

import com.berksozcu.entites.currency.CurrencyRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CurrencyRateRepository extends JpaRepository<CurrencyRate, Long> {
    Optional<CurrencyRate> findByCurrencyAndLastUpdated(String currency, LocalDate date);
    Optional<CurrencyRate> findByCurrency(String currency);
    Optional<CurrencyRate> findFirstByCurrencyAndLastUpdatedOrderByLastUpdatedDesc(String currency,
                                                      LocalDate date);
}
