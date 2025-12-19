package com.berksozcu.entites.material;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

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
//
//   @Column(name = "Son Satın Alma Fiyatı")
//   private BigDecimal lastPurchasePrice;
//
//   @Column(name = "Son Satış Fiyatı")
//   private BigDecimal lastSalesPrice;
}
