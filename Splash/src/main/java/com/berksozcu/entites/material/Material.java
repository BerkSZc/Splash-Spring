package com.berksozcu.entites.material;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "material")
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Material {
    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
//
    private Long id;

    @Column(name = "code", unique = true)
    private String code;

    //Açıklama
    private String comment;

    @Enumerated(EnumType.STRING)
    //Birim
    private MaterialUnit unit;

    @Column(name = "purchase_price", precision = 18, scale = 2 )
    private BigDecimal purchasePrice;

    //Para birimi
    @Column(name = "purchase_currency")
    @Enumerated(EnumType.STRING)
    private Currency purchaseCurrency = Currency.TRY;

    @Column(name = "sales_price", precision = 18, scale = 2 )
    private BigDecimal salesPrice;

    //Para birimi
    @Column(name = "sales_currency")
    @Enumerated(EnumType.STRING)
    private Currency salesCurrency= Currency.TRY;
}
