package com.berksozcu.entites.currency;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "currency_rate")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Para Birimi
    private String currency;

    @Column(name = "buying_rate", precision = 18, scale = 2)
    private BigDecimal buyingRate;

    @Column(name = "selling_rate", precision = 18, scale = 2)
    private BigDecimal sellingRate;

    @Column(name = "last_updated")
    private LocalDate lastUpdated;
}
