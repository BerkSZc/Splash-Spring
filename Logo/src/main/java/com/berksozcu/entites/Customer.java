package com.berksozcu.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Müşteri")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Müşteri Unvanı")
    private String name;

    @Column(name = "Bakiye", precision = 18, scale = 2)
    private BigDecimal balance;

    @Column(name = "Adres")
    private String address;

    @Column(name = "Ülke")
    private String country;

    @Column(name = "İl")
    private String local;

    @Column(name = "İlçe")
    private String district;

    @Column(name = "Vergi Dairesi No")
    private BigDecimal VdNo;

}

