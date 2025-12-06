package com.berksozcu.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "Malzemeler")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Kodu")
    private String code;

    @Column(name = "Açıklama")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "Birim")
    private Birim unit;
//
//   @Column(name = "Son Satın Alma Fiyatı")
//   private BigDecimal lastPurchasePrice;
//
//   @Column(name = "Son Satış Fiyatı")
//   private BigDecimal lastSalesPrice;
}
